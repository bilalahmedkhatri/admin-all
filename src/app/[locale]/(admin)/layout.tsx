import DashboardShell from "@/layout/DashboardShell";
import { requireUser } from "@/lib/gateway/auth.server";
import { pageRequest,handlePageError } from "@/lib/gateway/runtime.server";
export const dynamic="force-dynamic";
export default async function AdminLayout({children}:{children:React.ReactNode}){
 let user;try{user=await requireUser(await pageRequest("/"),undefined,false)}catch(error){return handlePageError(error)}
 return <DashboardShell user={{name:user.name,email:user.email,role:user.role,page_permissions:user.page_permissions}}>{children}</DashboardShell>;
}
