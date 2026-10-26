import "server-only";
import { json, type LoaderFunctionArgs } from "@/lib/gateway/http.server";
import { requireUser } from "@/lib/gateway/auth.server";
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  return json(
    {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
