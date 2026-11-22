import { listTenants } from '../../commands/tenant/tenant-api.js';

export async function checkAuth(): Promise<{ok:boolean;message:string}> {
    try {
        await listTenants();
        return {ok:true,message:'Central tenant administration credential accepted'};
    }catch(error){
        return {ok:false,message:'Central authentication check failed: '+
            (error instanceof Error?error.message:'Unknown error')};
    }
}
