import { ApiClient } from '../../api/client.js';
import { loadConfig } from '../../config/load-config.js';

export async function checkConfig():Promise<{ok:boolean;message:string}> {
    try {
        const c=loadConfig();
        new ApiClient(c);
        if(!c.apiKey || Buffer.byteLength(c.apiKey,'utf8')<32){
            return {ok:false,message:'CENTRAL_API_KEY is not configured'};
        }
        return {ok:true,message:'Central API URL and credential format valid'};
    }catch(error){
        return {ok:false,message:'Central CLI configuration invalid: '+
            (error instanceof Error?error.message:'Unknown error')};
    }
}
