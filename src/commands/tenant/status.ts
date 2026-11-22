import { Command } from 'commander';
import { renderTable } from '../../output/table.js';
import { formatRelativeTime } from '../../output/time.js';
import { listTenantStatuses } from './tenant-api.js';

const intervalMs = 5_000;
export const tenantStatusCommand = new Command('status')
    .description('Show central tenant online/offline status')
    .option('--once','Fetch once and exit')
    .action(async(options:{once?:boolean})=>{
        let stopped=false;
        const onSignal=()=>{ stopped=true; };
        process.on('SIGINT',onSignal);
        try {
            do {
                try {
                    const rows=(await listTenantStatuses()).map(t=>({
                        TENANT:t.id, STATUS:t.status,
                        ONLINE:t.online===true?'Online':t.online===false?'Offline':'Unknown',
                        'LAST SEEN':t.lastHeartbeat?formatRelativeTime(t.lastHeartbeat):'—'
                    }));
                    if(process.stdout.isTTY) console.clear();
                    renderTable(rows);
                } catch(error) {
                    console.error('Tenant status failed:',error instanceof Error?error.message:'Unknown error');
                    process.exitCode=1;
                    break;
                }
                if(!options.once && !stopped) await new Promise(resolve=>setTimeout(resolve,intervalMs));
            } while(!stopped && !options.once);
        } finally {process.off('SIGINT',onSignal);}
    });
