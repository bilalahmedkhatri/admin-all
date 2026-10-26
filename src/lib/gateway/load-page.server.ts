import "server-only";
import {handlePageError,handleResponse} from "./runtime.server";
export async function loadPage<T>(read:()=>Promise<T>):Promise<Exclude<T,Response>>{
 let data:T;try{data=await read()}catch(error){return handlePageError(error)}
 if(data instanceof Response)return handleResponse(data);
 return data as Exclude<T,Response>;
}
