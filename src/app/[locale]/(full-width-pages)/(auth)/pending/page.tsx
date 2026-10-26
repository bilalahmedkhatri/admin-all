import View from "@/components/gateway/pages/pending";

import {FeatureForms} from "@/components/gateway/forms";

export const dynamic="force-dynamic";
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 await searchParams;const data=null;
 return <FeatureForms path="/pending"><View data={data}/></FeatureForms>;
}
