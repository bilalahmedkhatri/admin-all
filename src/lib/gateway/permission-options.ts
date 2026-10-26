import type { AdminUser } from "./types";

export type PermissionKind =
  "page" | "section" | "component" | "endpoint" | "credential";
export type Selection = Record<PermissionKind, string[]>;
export type PermissionCatalog = {
  pages: string[];
  sections: string[];
  components: string[];
  grants: string[];
  credentials: { id: number; label: string }[];
};

export function initialSelection(user?: AdminUser): Selection {
  return {
    page: JSON.parse(user?.page_permissions || "[]"),
    section: user?.sections || [],
    component: user?.components || [],
    endpoint: JSON.parse(user?.grants || "[]"),
    credential: (JSON.parse(user?.credential_ids || "[]") as number[]).map(
      String,
    ),
  };
}

export function endpointSection(operation: string) {
  const path = operation.split(" ")[1] || "";
  return path.startsWith("/api/v1/") ? path.split("/")[3] : "ops";
}

export function endpointAction(operation: string) {
  const [method, path] = operation.split(" ");
  if (path === "/api/v1/audio/sample") return "create";
  if (
    path?.startsWith("/api/v1/audio/tts/retry/") ||
    path === "/api/v1/audio/tts/renew-url"
  )
    return "update";
  return (
    (
      {
        POST: "create",
        PUT: "update",
        PATCH: "update",
        DELETE: "delete",
      } as Record<string, string>
    )[method] || "read"
  );
}

export function sectionOperations(
  catalog: PermissionCatalog,
  section: string,
  role: string,
) {
  return catalog.grants.filter(
    (operation) =>
      endpointSection(operation) === section &&
      (role === "admin" ||
        !["apps", "keys", "cron", "ops"].includes(section)) &&
      (role !== "viewer" || endpointAction(operation) === "read"),
  );
}

export function relatedComponents(
  catalog: PermissionCatalog,
  page: string,
  section: string,
  role: string,
) {
  if (page === "blog-editor")
    return catalog.components.filter(
      (key) =>
        key.startsWith("blog.") &&
        !key.startsWith("blog.app.") &&
        (role !== "viewer" ||
          !["blog.create", "blog.update", "blog.publish"].includes(key)),
    );
  if (page === "endpoints") {
    const operations = sectionOperations(catalog, section, role);
    if (!operations.length) return [];
    const actions = new Set(operations.map(endpointAction));
    return catalog.components.filter(
      (key) =>
        key === "endpoint.execute" ||
        (key.startsWith("endpoint.") &&
          actions.has(key.slice("endpoint.".length))),
    );
  }
  const prefix = (
    { users: "members.", settings: "credentials." } as Record<string, string>
  )[page];
  return prefix
    ? catalog.components.filter((key) => key.startsWith(prefix))
    : [];
}

export function togglePermission(
  selection: Selection,
  kind: PermissionKind,
  value: string,
  checked: boolean,
): Selection {
  const next = {
    ...selection,
    [kind]: checked
      ? [...new Set([...selection[kind], value])]
      : selection[kind].filter((key) => key !== value),
  };
  if (!checked && kind === "page") {
    const prefix = (
      {
        endpoints: "endpoint.",
        "blog-editor": "blog.",
        users: "members.",
        settings: "credentials.",
      } as Record<string, string>
    )[value];
    if (prefix)
      next.component = next.component.filter((key) => !key.startsWith(prefix));
    if (value === "endpoints") {
      next.section = [];
      next.endpoint = [];
      next.credential = [];
    }
  }
  if (!checked && kind === "section")
    next.endpoint = next.endpoint.filter(
      (key) => endpointSection(key) !== value,
    );
  return next;
}
