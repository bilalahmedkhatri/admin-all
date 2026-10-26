import "server-only";
import { cache } from "react";
import { adminOrigin } from "./config.server";
import { redirect } from "@/lib/gateway/http.server";
import { backend, sessionCookie } from "./backend.server";
import type { AdminUser, Role } from "./types";
import { hasPage, pageForPath } from "./permissions";
// React owns this cache for one server render; never a process/session TTL cache.
// Primitive cookie identity lets layout/page Requests share one live /me read.
const readCurrentUser = cache(async (cookieHeader: string | null): Promise<AdminUser | null> => {
  const request = new Request(adminOrigin(), {
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  });
  if (
    typeof (await sessionCookie.parse(request.headers.get("Cookie"))) !==
    "string"
  )
    return null;
  try {
    return await backend<AdminUser>(request, "/me");
  } catch (error) {
    if (error instanceof Response && [401, 403].includes(error.status))
      return null;
    throw error;
  }
});
export async function currentUser(request: Request): Promise<AdminUser | null> {
  return readCurrentUser(request.headers.get("Cookie"));
}
export async function requireUser(
  request: Request,
  roles?: Role[],
  checkPage = true,
) {
  const user = await currentUser(request);
  if (!user) throw redirect("/login");
  if (!user.approved) throw redirect("/pending");
  if (roles && !roles.includes(user.role))
    throw new Response("Action permission denied", { status: 403 });
  const page = pageForPath(new URL(request.url).pathname);
  if (checkPage && page && !hasPage(user, page))
    throw new Response("Page permission denied", { status: 403 });
  return user;
}
export function checkOrigin(request: Request) {
  if (request.headers.get("Origin") !== adminOrigin())
    throw new Response("Invalid request origin", { status: 403 });
}
export async function logout(request: Request) {
  checkOrigin(request);
  try {
    await backend(request, "/logout", { method: "POST" });
  } catch (error) {
    if (!(error instanceof Response && [401, 403].includes(error.status)))
      throw error;
  }
  return redirect("/login", {
    headers: { "Set-Cookie": await sessionCookie.serialize("", { maxAge: 0 }) },
  });
}
