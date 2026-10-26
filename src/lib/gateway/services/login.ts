import "server-only";
import { redirect, type LoaderFunctionArgs } from "@/lib/gateway/http.server";
import { currentUser } from "@/lib/gateway/auth.server";
import { landing } from "@/lib/gateway/permissions";
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await currentUser(request);
  if (user) return redirect(landing(user));
  return { oauth: new URL(request.url).searchParams.get("oauth") };
}
