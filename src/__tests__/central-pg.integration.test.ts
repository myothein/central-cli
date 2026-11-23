import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { generateKeyPairSync, sign as rsaSign } from 'node:crypto';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import type { Server } from 'node:http';
import { ApiClient } from '../api/client.js';
import { listTenants, getTenantStatus, setTenantPaused, listTenantStatuses } from '../commands/tenant/tenant-api.js';

const load = createRequire(import.meta.url);
// Pin the exact central-service commit in CI before running this test.
const central = load(path.resolve('integration/central-service/dist/server.js'));
const dbFns = load(path.resolve('integration/central-service/dist/infrastructure/db/system-pool.js'));
const execFileAsync = promisify(execFile);

function signJwt(key: ReturnType<typeof generateKeyPairSync>['privateKey'],
    issuer: string, audience: string, roles: string[]) {
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'central-ci' }))
        .toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const payload = Buffer.from(JSON.stringify({
        iss: issuer, aud: audience, sub: 'qa-central-cli-operator',
        iat: now, exp: now + 300, realm_access: { roles }
    })).toString('base64url');
    const input = header + '.' + payload;
    return input + '.' + rsaSign('RSA-SHA256', Buffer.from(input), key).toString('base64url');
}

test('real OIDC Central Service + PostgreSQL: CLI list/status/pause/resume with central-admin JWT', {
    skip: process.env.RUN_PG_INTEGRATION !== '1'
}, async () => {
    const id = 'university-cli-ci';
    const audience = 'gtsp-central-cli-ci';
    const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const jwk = publicKey.export({ format: 'jwk' });
    const jwksServer = createServer((req, res) => {
        if (req.url === '/realms/gtsp/protocol/openid-connect/certs') {
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ keys: [{ ...jwk, kid: 'central-ci', alg: 'RS256', use: 'sig' }] }));
            return;
        }
        res.writeHead(404).end();
    });
    let listener: Server | undefined;
    const original: Record<string, string | undefined> = {};
    const envKeys = [
        'NODE_ENV', 'CENTRAL_ADMIN_AUTH_MODE', 'CENTRAL_OIDC_ISSUER',
        'CENTRAL_OIDC_JWKS_URL', 'CENTRAL_OIDC_AUDIENCE',
        'CENTRAL_OIDC_REQUIRED_ROLE', 'CENTRAL_ADMIN_API_KEY',
        'CENTRAL_ALLOW_DEV_API_KEY'
    ];
    for (const key of envKeys) original[key] = process.env[key];
    try {
        jwksServer.listen(0, '127.0.0.1');
        await once(jwksServer, 'listening');
        const jwksAddress = jwksServer.address();
        if (!jwksAddress || typeof jwksAddress === 'string') throw Error('No mock issuer listener');
        const issuer = 'http://127.0.0.1:' + jwksAddress.port + '/realms/gtsp';
        const token = signJwt(privateKey, issuer, audience, ['CENTRAL_ADMIN']);
        const wrongRole = signJwt(privateKey, issuer, audience, ['TENANT_ADMIN']);
        const wrongKey = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey;
        const invalidSignature = signJwt(wrongKey, issuer, audience, ['CENTRAL_ADMIN']);

        process.env.NODE_ENV = 'test';
        process.env.CENTRAL_ADMIN_AUTH_MODE = 'oidc';
        process.env.CENTRAL_OIDC_ISSUER = issuer;
        process.env.CENTRAL_OIDC_JWKS_URL = issuer + '/protocol/openid-connect/certs';
        process.env.CENTRAL_OIDC_AUDIENCE = audience;
        process.env.CENTRAL_OIDC_REQUIRED_ROLE = 'CENTRAL_ADMIN';
        // No static admin key may be needed for this integration path.
        delete process.env.CENTRAL_ADMIN_API_KEY;
        delete process.env.CENTRAL_ALLOW_DEV_API_KEY;

        const db = dbFns.getSystemPool();
        await db.query(
            'INSERT INTO "tenants" ("id","name","databaseUrl") VALUES ($1,$2,$3)',
            [id, 'Synthetic Test University', 'not-a-real-database-url']
        );
        listener = central.app.listen(0, '127.0.0.1') as Server;
        await once(listener, 'listening');
        const address = listener.address();
        if (!address || typeof address === 'string') throw Error('No test listener');
        const root = 'http://127.0.0.1:' + address.port + '/api/v1';
        const client = new ApiClient({ centralApiUrl: root, oidcAccessToken: token });

        const list = await listTenants(client);
        assert.ok(list.some(t => t.id === id));
        assert.ok(!JSON.stringify(list).includes('not-a-real-database-url'),
            'Central API must not expose databaseUrl');
        assert.equal((await getTenantStatus(id, client)).online, false);
        await db.query(
            'UPDATE "tenants" SET "lastHeartbeat"=CURRENT_TIMESTAMP WHERE "id"=$1', [id]);
        assert.equal((await getTenantStatus(id, client)).online, true);
        const statuses = await listTenantStatuses(client);
        assert.equal(statuses.find(t => t.id === id)?.online, true);
        const paused = await setTenantPaused(id, true, client);
        assert.equal(paused.status, 'SUSPENDED');
        assert.equal((await getTenantStatus(id, client)).online, false);
        const resumed = await setTenantPaused(id, false, client);
        assert.equal(resumed.status, 'ACTIVE');

        await assert.rejects(() => new ApiClient({
            centralApiUrl: root, oidcAccessToken: wrongRole
        }).get('/tenants'), /HTTP 403/);
        await assert.rejects(() => new ApiClient({
            centralApiUrl: root, oidcAccessToken: invalidSignature
        }).get('/tenants'), /HTTP 401/);

        // Exercise the real compiled CLI process, not only the imported API client.
        const response = await execFileAsync(process.execPath, ['dist/index.js', 'tenant', 'list'], {
            env: {
                ...process.env, CENTRAL_API_URL: root,
                CENTRAL_AUTH_MODE: 'oidc', CENTRAL_OIDC_ACCESS_TOKEN: token,
                CENTRAL_API_KEY: '', CENTRAL_ALLOW_DEV_API_KEY: 'false'
            },
            timeout: 15_000
        });
        assert.match(response.stdout, /university-cli-ci/,
            'Real CLI must list a tenant with a signed Central OIDC JWT');
    } finally {
        if (listener) await new Promise<void>((resolve, reject) =>
            listener!.close(error => error ? reject(error) : resolve()));
        if (jwksServer.listening) await new Promise<void>((resolve, reject) =>
            jwksServer.close(error => error ? reject(error) : resolve()));
        await dbFns.closeSystemPool();
        for (const key of envKeys) {
            const value = original[key];
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    }
});
