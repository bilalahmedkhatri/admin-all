import View from "@/components/gateway/pages/verify-email";
import {loader} from "@/lib/gateway/services/verify-email";
import {FeatureForms} from "@/components/gateway/forms";
import {pageRequest} from "@/lib/gateway/runtime.server";
import {loadPage} from "@/lib/gateway/load-page.server";
export const dynamic="force-dynamic";
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const request=await pageRequest("/verify-email",await searchParams);const data=await loadPage(()=>loader({request,params:{}}));
 return <FeatureForms path="/verify-email"><View data={data}/></FeatureForms>;
}
