import View from "@/components/gateway/pages/access";
import {loader} from "@/lib/gateway/services/access";
import {FeatureForms} from "@/components/gateway/forms";
import {pageRequest} from "@/lib/gateway/runtime.server";
import {loadPage} from "@/lib/gateway/load-page.server";
export const dynamic="force-dynamic";
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const request=await pageRequest("/access",await searchParams);const data=await loadPage(()=>loader({request,params:{}}));
 return <FeatureForms path="/access"><View data={data}/></FeatureForms>;
}
