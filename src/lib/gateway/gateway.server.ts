import "server-only";
import { backend, gatewayURL } from "./backend.server";
import type { Spec, Endpoint } from "./openapi";
import type { AdminUser } from "./types";
export { gatewayURL } from "./backend.server";
export async function catalog(request: Request) {
  return backend<{ spec: Spec; live: boolean; error: string | null }>(
    request,
    "/catalog",
  );
}
export async function health() {
  try {
    return (
      await fetch(new URL("/health", gatewayURL()), {
        redirect: "error",
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      })
    ).ok;
  } catch {
    return false;
  }
}
export async function execute(
  request: Request,
  _user: AdminUser,
  endpoint: Endpoint,
  form: FormData,
) {
  return backend<{
    status: number;
    elapsed: number;
    result: unknown;
    error: string | null;
  }>(request, `/operations/${endpoint.id}`, { method: "POST", body: form });
}
