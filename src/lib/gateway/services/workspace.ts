import "server-only";
import { json, type LoaderFunctionArgs } from "@/lib/gateway/http.server";
import { requireUser } from "@/lib/gateway/auth.server";
import { catalog } from "@/lib/gateway/gateway.server";
import { endpoints } from "@/lib/gateway/openapi";
import { canViewEndpoint } from "@/lib/gateway/permissions";
import { backend } from "@/lib/gateway/backend.server";
import { pendingAccess } from "@/lib/gateway/pending-access";
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request, undefined, false);
  const metadata = await catalog(request);
  const all = endpoints(metadata.spec).filter((e) => canViewEndpoint(user, e));
  const pendingRequests =
    user.role === "admin"
      ? pendingAccess(
          await backend<{
            requests: {
              id: number;
              email: string;
              name: string;
              status: string;
              email_verified: boolean;
            }[];
            users: {
              id: number;
              email: string;
              name: string;
              status: string;
            }[];
          }>(request, "/members"),
        )
      : [];
  return json(
    {
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        page_permissions: user.page_permissions,
      },
      pending: pendingRequests.length,
      pendingRequests,
      live: metadata.live,
      count: all.length,
      groups: [...new Set(all.map((e) => e.group))],
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
