import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import type {Server} from 'node:http';
import { ApiClient } from '../api/client.js';
import { listTenants,getTenantStatus,setTenantPaused,listTenantStatuses } from '../commands/tenant/tenant-api.js';

const load=createRequire(import.meta.url);
const central=load(path.resolve('integration/central-service/dist/server.js'));
const dbFns=load(path.resolve('integration/central-service/dist/infrastructure/db/system-pool.js'));
const execFileAsync=promisify(execFile);

test('real Central Service + PostgreSQL: list/status/pause/resume and CLI command', {
    skip:process.env.RUN_PG_INTEGRATION!=='1'
},async()=>{
    const id='university-cli-ci';
    const key=process.env.CENTRAL_ADMIN_API_KEY;
    assert.ok(key && key.length>=32);
    let listener:Server | undefined;
    try {
        const db=dbFns.getSystemPool();
        await db.query(
            'INSERT INTO "tenants" ("id","name","databaseUrl") VALUES ($1,$2,$3)',
            [id,'Synthetic Test University','not-a-real-database-url']
        );
        listener=central.app.listen(0,'127.0.0.1') as Server;
        await once(listener,'listening');
        const address=listener.address();
        if(!address||typeof address==='string')throw Error('No test listener');
        const root='http://127.0.0.1:'+address.port+'/api/v1';
        const client=new ApiClient({centralApiUrl:root,apiKey:key});

        const list=await listTenants(client);
        assert.ok(list.some(t=>t.id===id));
        assert.ok(!JSON.stringify(list).includes('not-a-real-database-url'),
            'Central API must not expose databaseUrl');
        const before=await getTenantStatus(id,client);
        assert.equal(before.online,false);
        await db.query(
            'UPDATE "tenants" SET "lastHeartbeat"=CURRENT_TIMESTAMP WHERE "id"=$1',[id]);
        const live=await getTenantStatus(id,client);
        assert.equal(live.online,true);
        const statuses=await listTenantStatuses(client);
        assert.equal(statuses.find(t=>t.id===id)?.online,true);
        const paused=await setTenantPaused(id,true,client);
        assert.equal(paused.status,'SUSPENDED');
        const unavailable=await getTenantStatus(id,client);
        assert.equal(unavailable.online,false);
        const resumed=await setTenantPaused(id,false,client);
        assert.equal(resumed.status,'ACTIVE');

        await assert.rejects(()=>new ApiClient({
            centralApiUrl:root,apiKey:'not-the-real-key-but-long-enough-for-testing'
        }).get('/tenants'),/HTTP 401/);
        const response=await execFileAsync(process.execPath,['dist/index.js','tenant','list'],{
            env:{...process.env,CENTRAL_API_URL:root,CENTRAL_API_KEY:key},
            timeout:15_000
        });
        assert.match(response.stdout,/university-cli-ci/,
            'Real CLI must list a tenant from Central Service');
    }finally{
        if(listener)await new Promise<void>((resolve,reject)=>
            listener!.close(error=>error?reject(error):resolve()));
        await dbFns.closeSystemPool();
    }
});
