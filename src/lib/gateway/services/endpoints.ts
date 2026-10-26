import "server-only";
import { type LoaderFunctionArgs } from "@/lib/gateway/http.server";
import { requireUser } from "@/lib/gateway/auth.server";
import { catalog } from "@/lib/gateway/gateway.server";
import { endpoints } from "@/lib/gateway/openapi";
import { canViewEndpoint } from "@/lib/gateway/permissions";
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const meta = await catalog(request);
  return {
    all: endpoints(meta.spec).filter((e) => canViewEndpoint(user, e)),
    error: meta.error,
  };
}
