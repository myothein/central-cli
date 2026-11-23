import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { ApiClient } from '../api/client.js';
import { listTenants, getTenantStatus, setTenantPaused, listTenantStatuses, assertTenantId } from '../commands/tenant/tenant-api.js';

// A synthetic JWT-shaped value tests forwarding only. Real JWT verification is in Central Service.
const token = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjaS1vcGVyYXRvciJ9.c2lnbmF0dXJl';

test('Central client rejects insecure public URL and embedded credentials',()=>{
    assert.throws(()=>new ApiClient({centralApiUrl:'http://example.com/api/v1',oidcAccessToken:token}),/HTTPS/);
    assert.throws(()=>new ApiClient({centralApiUrl:'https://evil:secret@example.com/api/v1',oidcAccessToken:token}),/HTTPS/);
    assert.throws(()=>new ApiClient({centralApiUrl:'https://example.com/api',oidcAccessToken:token}),/HTTPS/);
    assert.throws(()=>assertTenantId('../outside'),/Invalid tenant/);
});

test('Central v1 tenant list, status, pause, resume forward the OIDC bearer token',async()=>{
    const seen: {method:string;path:string;auth:string|undefined}[]=[];
    let paused=false;
    const server=createServer((req,res)=>{
        const route=req.url??'';
        seen.push({method:req.method??'',path:route,auth:req.headers.authorization});
        res.setHeader('content-type','application/json');
        if(req.headers.authorization!=='Bearer '+token){
            res.statusCode=401;res.end(JSON.stringify({success:false,message:'Forbidden'}));return;
        }
        const tenant={id:'university-ci',name:'CI University',
            status:paused?'SUSPENDED':'ACTIVE',lastHeartbeat:null};
        if(route==='/api/v1/tenants' && req.method==='GET'){
            res.end(JSON.stringify({success:true,data:[tenant]}));return;
        }
        if(route==='/api/v1/tenants/university-ci/status' && req.method==='GET'){
            res.end(JSON.stringify({success:true,data:{...tenant,online:!paused}}));return;
        }
        if(route==='/api/v1/tenants/university-ci/pause' && req.method==='POST'){
            paused=true;res.end(JSON.stringify({success:true,data:{...tenant,status:'SUSPENDED'}}));return;
        }
        if(route==='/api/v1/tenants/university-ci/resume' && req.method==='POST'){
            paused=false;res.end(JSON.stringify({success:true,data:{...tenant,status:'ACTIVE'}}));return;
        }
        res.statusCode=404;res.end(JSON.stringify({success:false,message:'Not Found'}));
    });
    server.listen(0,'127.0.0.1');
    try{
        await once(server,'listening');
        const address=server.address();
        if(!address || typeof address==='string')throw Error('No HTTP listener');
        const client=new ApiClient({centralApiUrl:'http://127.0.0.1:'+address.port+'/api/v1',oidcAccessToken:token});
        const listed=await listTenants(client);
        assert.deepEqual(listed.map(t=>t.id),['university-ci']);
        assert.equal((await getTenantStatus('university-ci',client)).online,true);
        assert.equal((await setTenantPaused('university-ci',true,client)).status,'SUSPENDED');
        assert.equal((await listTenantStatuses(client))[0].online,false);
        assert.equal((await setTenantPaused('university-ci',false,client)).status,'ACTIVE');
        assert.ok(seen.every(s=>s.auth==='Bearer '+token));
        assert.deepEqual(seen.map(s=>s.path),[
            '/api/v1/tenants','/api/v1/tenants/university-ci/status',
            '/api/v1/tenants/university-ci/pause','/api/v1/tenants',
            '/api/v1/tenants/university-ci/status','/api/v1/tenants/university-ci/resume'
        ]);
    }finally{await new Promise<void>((resolve,reject)=>server.close(err=>err?reject(err):resolve()));}
});

test('Central client denies missing OIDC bearer token before any request',async()=>{
    const client=new ApiClient({centralApiUrl:'http://127.0.0.1:10001/api/v1'});
    await assert.rejects(()=>client.get('/tenants'),/CENTRAL_OIDC_ACCESS_TOKEN/);
});

test('legacy key is disabled by default and cannot be enabled for production', async () => {
    const oldNodeEnv = process.env.NODE_ENV;
    try {
        const legacy = new ApiClient({
            centralApiUrl: 'http://127.0.0.1:3000/api/v1',
            authMode: 'legacy', apiKey: 'ci-only-shared-key-longer-than-32-bytes',
            allowLegacyDevApiKey: true
        });
        process.env.NODE_ENV = 'production';
        await assert.rejects(() => legacy.get('/tenants'), /Legacy Central API credentials disabled/);
        process.env.NODE_ENV = 'test';
        const denied = new ApiClient({
            centralApiUrl: 'http://127.0.0.1:3000/api/v1',
            authMode: 'legacy', apiKey: 'ci-only-shared-key-longer-than-32-bytes'
        });
        await assert.rejects(() => denied.get('/tenants'), /Legacy Central API credentials disabled/);
    } finally {
        if (oldNodeEnv === undefined) delete process.env.NODE_ENV;
        else process.env.NODE_ENV = oldNodeEnv;
    }
});

test('OIDC mode never falls back to a configured legacy key', async () => {
    const client = new ApiClient({
        centralApiUrl: 'http://127.0.0.1:3000/api/v1',
        authMode: 'oidc', apiKey: 'ci-only-shared-key-longer-than-32-bytes'
    });
    await assert.rejects(() => client.get('/tenants'), /CENTRAL_OIDC_ACCESS_TOKEN/);
});

test('invalid OIDC token format is rejected before networking', async () => {
    for (const value of ['abc', 'opaque-token', 'x.y', 'x.y.z\nanother-header']) {
        const client = new ApiClient({
            centralApiUrl: 'http://127.0.0.1:3000/api/v1',
            authMode: 'oidc', oidcAccessToken: value
        });
        await assert.rejects(() => client.get('/tenants'), /CENTRAL_OIDC_ACCESS_TOKEN/);
    }
});

test('API errors never echo untrusted response body or secret token',async()=>{
    const server=createServer((_req,res)=>{
        res.statusCode=403;
        res.end('secret-response-body-should-not-leak '+token);
    });
    server.listen(0,'127.0.0.1');
    try{
        await once(server,'listening');
        const address=server.address();
        if(!address||typeof address==='string')throw Error('No listener');
        const client=new ApiClient({centralApiUrl:'http://127.0.0.1:'+address.port+'/api/v1',oidcAccessToken:token});
        await assert.rejects(()=>client.get('/tenants'),err=>{
            assert.ok(err instanceof Error);
            assert.match(err.message,/HTTP 403/);
            assert.ok(!err.message.includes(token));
            assert.ok(!err.message.includes('secret-response-body-should-not-leak'));
            return true;
        });
    }finally{await new Promise<void>((resolve,reject)=>server.close(err=>err?reject(err):resolve()));}
});
