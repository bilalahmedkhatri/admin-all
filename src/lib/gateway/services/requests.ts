import "server-only";
import { json, type LoaderFunctionArgs } from "@/lib/gateway/http.server";
import { requireUser } from "@/lib/gateway/auth.server";
import { requestRecords } from "@/lib/gateway/request-records.server";
export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request, ["admin"]);
  return json(await requestRecords(request), {
    headers: { "Cache-Control": "no-store" },
  });
}
