import "server-only";
import { type LoaderFunctionArgs } from "@/lib/gateway/http.server";
import { requireUser } from "@/lib/gateway/auth.server";
import { catalog, health } from "@/lib/gateway/gateway.server";
import { backend } from "@/lib/gateway/backend.server";
import { type Analytics } from "@/components/gateway/analytics";
import { endpoints } from "@/lib/gateway/openapi";
import { canViewEndpoint, hasPage } from "@/lib/gateway/permissions";
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const days = new URL(request.url).searchParams.get("days") || "7";
  const [meta, healthy, summary, analytics] = await Promise.all([
    catalog(request),
    health(),
    backend<{
      team: { count: number; pending: number } | null;
      keys: number | null;
      activity: {
        action: string;
        target: string;
        status: number;
        created_at: string;
      }[];
    }>(request, "/overview"),
    backend<Analytics>(
      request,
      `/analytics?days=${encodeURIComponent(days)}`,
    ).catch((error) => {
      if (
        error instanceof Response &&
        (error.status === 404 || error.status >= 500)
      ) {
        console.error("Overview analytics unavailable", {
          status: error.status,
        });
        return null;
      }
      throw error;
    }),
  ]);
  const all = endpoints(meta.spec).filter((e) => canViewEndpoint(user, e));
  return {
    showEndpoints: hasPage(user, "endpoints"),
    showActivity: hasPage(user, "activity"),
    name: user.name.split(" ")[0],
    all,
    groups: [...new Set(all.map((e) => e.group))],
    live: meta.live,
    error: meta.error,
    healthy,
    ...summary,
    analytics,
  };
}
