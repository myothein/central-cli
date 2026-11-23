import { Command } from 'commander';
import { assertTenantId, setTenantPaused } from './tenant-api.js';

export const tenantResumeCommand = new Command('resume')
    .description('Resume a tenant in Central Service')
    .argument('<tenantId>','Tenant to resume')
    .option('--dry-run','Validate without writing')
    .action(async(tenantId:string,options:{dryRun?:boolean})=>{
        try {
            const id=assertTenantId(tenantId);
            if(options.dryRun) {console.log('DRY RUN: would resume tenant '+id);return;}
            const result=await setTenantPaused(id,false);
            console.log('Tenant '+result.id+' status: '+result.status);
        }catch(error){
            console.error('Tenant resume failed:',error instanceof Error?error.message:'Unknown error');
            process.exitCode=1;
        }
    });
