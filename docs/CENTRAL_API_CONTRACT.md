# Central CLI — Central Service v1 API Contract

Central Service uses `/api/v1`, not `/api`. The CLI defaults to localhost:3000/api/v1 for local DEV only. Configure `CENTRAL_API_URL` with HTTPS for any non-loopback host. Configure `CENTRAL_API_KEY` as an injected per-environment 32+ byte admin secret; do not commit or print keys.

- GET /tenants returns `{success:true,data:[{id,name,status,lastHeartbeat}]}`.
- GET /tenants/:id/status returns `{success:true,data:{id,name,status,lastHeartbeat,online}}`.
- POST /tenants/:id/pause and /resume require administrator credential and return a tenant data envelope.
- `tenant status --once` obtains the list, then calls each individual status endpoint; `/tenants/status` is NOT implemented.
- Other agent/event/projection commands are not certified: missing routes return HTTP 501 or 404 and the CLI must report failure, never false success. Further feature work depends on Central Service API completion.
- Builds and contract tests passing are not production authorization. No UIMS, production or real tenant mutation in this branch.

Remaining release gates: real Central PostgreSQL smoke, TLS integration, role policy, safe token rotation, audit logs, negative security tests and operator acceptance. Production NO-GO.
