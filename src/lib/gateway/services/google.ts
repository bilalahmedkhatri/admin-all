import "server-only";
import { redirect, type ActionFunctionArgs } from "@/lib/gateway/http.server";
import { checkOrigin } from "@/lib/gateway/auth.server";
import { startGoogle } from "@/lib/gateway/google.server";
export function loader() {
  return redirect("/login");
}
export async function action({ request }: ActionFunctionArgs) {
  checkOrigin(request);
  try {
    return await startGoogle(request);
  } catch {
    return redirect("/login?oauth=unconfigured");
  }
}
