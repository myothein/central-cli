import { Command } from 'commander';
import { assertTenantId, setTenantPaused } from './tenant-api.js';

export const tenantPauseCommand = new Command('pause')
    .description('Suspend a tenant in Central Service')
    .argument('<tenantId>','Tenant to suspend')
    .option('--dry-run','Validate without writing')
    .action(async(tenantId:string,options:{dryRun?:boolean})=>{
        try {
            const id=assertTenantId(tenantId);
            if(options.dryRun) {console.log('DRY RUN: would suspend tenant '+id);return;}
            const result=await setTenantPaused(id,true);
            console.log('Tenant '+result.id+' status: '+result.status);
        }catch(error){
            console.error('Tenant pause failed:',error instanceof Error?error.message:'Unknown error');
            process.exitCode=1;
        }
    });
