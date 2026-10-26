import "server-only";
import { type ActionFunctionArgs, redirect } from "@/lib/gateway/http.server";
import { logout } from "@/lib/gateway/auth.server";
export function loader() {
  return redirect("/login");
}
export function action({ request }: ActionFunctionArgs) {
  return logout(request);
}
