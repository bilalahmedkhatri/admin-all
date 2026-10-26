import {action} from "@/lib/gateway/services/logout";
export const dynamic="force-dynamic";
export async function POST(request:Request){try{const response=await action({request,params:{}});response.headers.set("Cache-Control","no-store");response.headers.set("Referrer-Policy","no-referrer");return response;}catch(error){if(error instanceof Response)return error;return new Response("Authentication service is unavailable",{status:503,headers:{"Cache-Control":"no-store"}})}}
