import { Command } from 'commander';
import { renderTable } from '../../output/table.js';
import { listTenants } from './tenant-api.js';

export const tenantListCommand = new Command('list')
    .description('List configured tenants')
    .action(async()=>{
        try {
            const rows=(await listTenants()).map(t=>({
                TENANT:t.id, NAME:t.name, STATUS:t.status,
                'LAST HEARTBEAT':t.lastHeartbeat ?? '—'
            }));
            renderTable(rows);
        } catch(error) {
            console.error('Tenant list failed:',error instanceof Error ? error.message : 'Unknown error');
            process.exitCode=1;
        }
    });
