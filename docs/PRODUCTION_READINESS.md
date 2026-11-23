# Production readiness gates — central-cli

**Status: NO-GO.** This proposed branch addresses source-control hygiene only. It is **not** a production certification.

## Mandatory pre-merge checks

- [ ] Arrange independent, verified backup of all runtime tenant databases, logs and original configuration. Removing tracked files from a branch must not erase the only copy of operational evidence.
- [ ] Review and rotate/revoke any potentially committed live credentials, and provision secret-manager environment injection. A Git commit deletion does **not** remove secrets or data from past Git history, forks or caches. History cleanup requires separately approved coordination.
- [ ] Generate and commit a pinned dependency lockfile; run clean reproducible dependency install and production build.
- [ ] Add unit/integration tests, verify cross-service API and DB contracts, and collect pass/fail evidence.
- [ ] Prove least-privilege authorization, auditability, tenant isolation, zero hard-coded production credentials, and recovery after restart.
- [ ] Complete service-specific blockers:
- [ ] Correct start script/entrypoint
- [ ] Align API base path and tenant/agent/event command routes
- [ ] Secure token handling and command authorization
- [ ] Windows/Linux CLI command smoke tests
- [ ] Require independent review, security scan, signed artifacts where applicable, restore drill and approved release go/no-go.

Do not integrate with UIMS V1 until the six infrastructure repositories pass their release gates. No production deployment is authorized by this PR.

## CI verification scope

The initial CI jobs check tracked-file hygiene, dependency lockfile presence, clean npm installation and TypeScript compilation. A successful result **does not** prove authentication, database migrations, offline data safety, functional tests, device integration, signing, or production readiness. Keep the PR as draft until independent release criteria pass.


## Central OIDC integration update — 2026-11-23

**Status: DRAFT / NO-GO.** These changes provide a signed-token pass-through client and synthetic integration tests. No live Keycloak authentication has been confirmed.

- Default CLI authentication uses \`CENTRAL_AUTH_MODE=oidc\` and a short-lived \`CENTRAL_OIDC_ACCESS_TOKEN\` injected into the CLI's process environment by the approved identity workflow. The CLI does not acquire, refresh, or persist Keycloak tokens in this change.
- The CLI performs minimal JWT shape checks only. **Only Central Service verifies JWT signatures, issuer/JWKS, audience, time claims, and its \`CENTRAL_ADMIN\` realm role.** Never trust client-side token parsing for authorization.
- Legacy \`CENTRAL_API_KEY\` is allowed only with explicit \`CENTRAL_AUTH_MODE=legacy\`, \`CENTRAL_ALLOW_DEV_API_KEY=true\`, and \`NODE_ENV=test|development\`. Production always rejects legacy mode.
- Central API URLs require HTTPS except loopback. No token values are printed by the API client and non-2xx response bodies are not propagated.
- CI pins the audited OIDC-capable Central Service commit, signs an ephemeral RS256 JWT with a local mock Keycloak-style JWKS endpoint, and executes real CLI tenant management commands against a disposable PostgreSQL 17 database. Negative tests cover wrong realm-wide role and signature. These tests **do not imply live Keycloak readiness**.

### Remaining required acceptance
- Confirm a real Keycloak realm, client, audience mapper and \`CENTRAL_ADMIN\` role mapping with exact scoped operator permissions and multi-factor authentication, as applicable.
- Choose and independently review a secure short-lived token acquisition/refresh workflow (e.g. approved OIDC Authorization Code + PKCE for an interactive operator or explicitly authorized workload identity). Avoid Resource Owner Password Credentials, long-lived bearer tokens, token values in CLI flags, history, logs or tracked config.
- Prove JWT revocation/expiration behavior, Keycloak JWKS rotation, privilege changes, command audit logging and least-privilege production policies.
- Cross-repository end-to-end tests, Windows/Linux functional acceptance, backups and Git historical exposure remediation remain release blockers.

No PR merge, live Keycloak changes, production deploy or UIMS integration is authorized by this work.
