import "server-only";
import { redirect, type LoaderFunctionArgs } from "@/lib/gateway/http.server";
import { currentUser } from "@/lib/gateway/auth.server";
import { landing } from "@/lib/gateway/permissions";
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await currentUser(request);
  if (!user) throw redirect("/login");
  if (!user.approved) throw redirect("/pending");
  const path = landing(user);
  if (path !== "/access") throw redirect(path);
  return null;
}
