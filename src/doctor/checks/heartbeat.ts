import { listTenantStatuses } from '../../commands/tenant/tenant-api.js';

/** Monitor registered tenants; this is NOT an agent-specific health endpoint. */
export async function checkHeartbeat(): Promise<{ok:boolean;message:string}> {
    try {
        const tenants=await listTenantStatuses();
        const online=tenants.filter(t=>t.online===true).length;
        return tenants.length
            ? {ok:online===tenants.length,
                message:'Tenants online: '+online+'/'+tenants.length}
            : {ok:false,message:'No tenants registered for heartbeat monitoring'};
    }catch(error){
        return {ok:false,message:'Tenant heartbeat check failed: '+
            (error instanceof Error?error.message:'Unknown error')};
    }
}
