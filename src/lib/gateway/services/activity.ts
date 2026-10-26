import "server-only";
import { type LoaderFunctionArgs } from "@/lib/gateway/http.server";
import { requireUser } from "@/lib/gateway/auth.server";
import { backend } from "@/lib/gateway/backend.server";
export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  const page = Math.min(
    100000,
    Math.max(
      1,
      Math.floor(Number(new URL(request.url).searchParams.get("page")) || 1),
    ),
  );
  return backend<{
    rows: import("@/lib/gateway/types").ActivityRow[];
    page: number;
    count: number;
  }>(request, `/activity?page=${page}`);
}
