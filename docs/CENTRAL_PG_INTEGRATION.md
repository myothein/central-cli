# Real Central CLI ↔ Central Service ↔ PostgreSQL 17 CI Acceptance

Test source is pinned at `central-service@26f068b862487cc9538d8a872381fac7ef82efe5` and `db-helper@bfae1246e28a43626e00627b9b812af579af4ab3`.

The CI job starts a real Express Central Service over loopback HTTP, applies the pinned system migration to an **ephemeral** PostgreSQL 17 service, registers a synthetic tenant, and verifies list, real heartbeat-derived status, pause/resume, denied credentials, no databaseUrl exposure and execution of `node dist/index.js tenant list`.

CI credentials are disposable example values and never production secrets. This test does not verify Windows operator shell, RBAC, TLS termination, real tenant provisioning, auditing or outage recovery. Production NO-GO.
