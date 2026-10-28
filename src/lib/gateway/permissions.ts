import type { Endpoint } from "./openapi";

export const pages = [
  { id: "overview", title: "Overview", path: "/" },
  { id: "endpoints", title: "API endpoints", path: "/endpoints" },
  { id: "api-keys", title: "API keys", path: "/api-keys" },
  { id: "prompts", title: "Prompts", path: "/Prompts" },
  { id: "blog-editor", title: "Blog Editor", path: "/blog-editor" },
  { id: "models", title: "Provider models", path: "/models", admin: true },
  { id: "apps", title: "Authorized apps", path: "/apps", admin: true },
  { id: "activity", title: "Activity", path: "/activity" },
  { id: "requests", title: "AI requests", path: "/requests", admin: true },
  { id: "users", title: "Team & permissions", path: "/users", admin: true },
  {
    id: "settings",
    title: "Credentials & settings",
    path: "/settings",
    admin: true,
  },
] as const;
export type PageId = (typeof pages)[number]["id"];
export type PermissionUser = {
  role: string;
  grants: string;
  page_permissions: string;
  sections?: string[];
  components?: string[];
};
export function hasPage(
  user: Pick<PermissionUser, "role" | "page_permissions">,
  page: PageId,
) {
  if (user.role === "admin") return true;
  if (page === "api-keys" || page === "prompts") return true;
  if (["users", "settings", "models", "requests", "apps"].includes(page))
    return false;
  return (JSON.parse(user.page_permissions || "[]") as string[]).includes(page);
}
export function pageForPath(path: string): PageId | undefined {
  if (path === "/overview" || path.startsWith("/overview/")) return "overview";
  const lowerPath = path.toLowerCase();
  return pages.find((p) =>
    p.path === "/"
      ? path === "/"
      : lowerPath === p.path.toLowerCase() ||
        lowerPath.startsWith(p.path.toLowerCase() + "/"),
  )?.id;
}
export function landing(
  user: Pick<PermissionUser, "role" | "page_permissions">,
) {
  return pages.find((p) => hasPage(user, p.id))?.path || "/access";
}
export function canViewEndpoint(user: PermissionUser, endpoint: Endpoint) {
  return (
    hasPage(user, "endpoints") &&
    (user.role === "admin" ||
      (!!user.sections?.includes(endpoint.group) &&
        (JSON.parse(user.grants) as string[]).includes(
          `${endpoint.method} ${endpoint.path}`,
        )))
  );
}
export function hasComponent(
  user: Pick<PermissionUser, "role" | "components">,
  component: string,
) {
  return user.role === "admin" || !!user.components?.includes(component);
}
