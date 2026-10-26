import "server-only";
import { requireUser } from "@/lib/gateway/auth.server";
import type { LoaderFunctionArgs } from "@/lib/gateway/http.server";
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  return {
    initialProfile: { name: user.name, email: user.email },
    membershipId: user.id,
    canCreate:
      user.role === "admin" ||
      Boolean(user.components?.includes("blog.create")),
    canUpdate:
      user.role === "admin" ||
      Boolean(user.components?.includes("blog.update")),
    canPublish:
      user.role === "admin" ||
      Boolean(user.components?.includes("blog.publish")),
  };
}
