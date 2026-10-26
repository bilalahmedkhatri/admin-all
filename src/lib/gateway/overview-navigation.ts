import { hasPage, type PermissionUser } from "./permissions";
export const overviewSections = [
  { id: "summary", path: "/", label: "summary" },
  { id: "collections", path: "/overview/collections", label: "collections" },
  { id: "analytics", path: "/overview/analytics", label: "analytics" },
  {
    id: "recent-activity",
    path: "/overview/recent-activity",
    label: "recentActivity",
  },
] as const;
export type OverviewSection = (typeof overviewSections)[number]["id"];
export function canViewOverviewSection(
  user: Pick<PermissionUser, "role" | "page_permissions">,
  section: OverviewSection,
) {
  return (
    hasPage(user, "overview") &&
    (section !== "collections" || hasPage(user, "endpoints")) &&
    (section !== "recent-activity" || hasPage(user, "activity"))
  );
}
