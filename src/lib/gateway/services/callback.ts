import "server-only";
import type { LoaderFunctionArgs } from "@/lib/gateway/http.server";
import { finishGoogle } from "@/lib/gateway/google.server";
export function loader({ request }: LoaderFunctionArgs) {
  return finishGoogle(request);
}
