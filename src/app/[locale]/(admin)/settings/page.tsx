import View from "@/components/gateway/pages/settings";
import {loader} from "@/lib/gateway/services/settings";

import {pageRequest} from "@/lib/gateway/runtime.server";
import {loadPage} from "@/lib/gateway/load-page.server";
import {FeatureForms} from "@/components/gateway/forms";
export const dynamic="force-dynamic";
export default async function Page({searchParams,params}:{searchParams:Promise<Record<string,string|string[]|undefined>>;params:Promise<{locale:string;id?:string}>}){
 const query=await searchParams,{id=""}=await params,route="/settings";
 const request=await pageRequest(route+(id?"/"+encodeURIComponent(id):""),query);
 const data=await loadPage(()=>loader({request,params:{id}}));
 
 return <FeatureForms path={route} id={id} search={new URL(request.url).search.slice(1)}><View data={data}/></FeatureForms>;
}
