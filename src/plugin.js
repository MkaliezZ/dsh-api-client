import {performRequest} from './core.js'; export function registerApiClient(ctx,options={}){ctx.command?.('api',async(method,url)=>JSON.stringify(await performRequest({method,url},options),null,2));}
