import View from "@/components/gateway/pages/register";

import {FeatureForms} from "@/components/gateway/forms";

export const dynamic="force-dynamic";
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 await searchParams;const data=null;
 return <FeatureForms path="/register"><View data={data}/></FeatureForms>;
}
