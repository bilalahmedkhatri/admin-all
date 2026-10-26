import { canViewEndpoint, hasComponent } from "./permissions";

export type Schema = {
  type?: string;
  title?: string;
  description?: string;
  default?: unknown;
  enum?: unknown[];
  properties?: Record<string, Schema>;
  required?: string[];
  items?: Schema;
  $ref?: string;
  anyOf?: Schema[];
  allOf?: Schema[];
  format?: string;
};
export type Parameter = {
  name: string;
  in: string;
  required?: boolean;
  description?: string;
  schema?: Schema;
};
export type Operation = {
  summary?: string;
  description?: string;
  tags?: string[];
  operationId?: string;
  parameters?: Parameter[];
  requestBody?: {
    required?: boolean;
    content: Record<string, { schema: Schema }>;
  };
  responses?: Record<string, unknown>;
};
export type Spec = {
  info: { title: string; version: string };
  paths: Record<string, Record<string, Operation>>;
  components?: {
    schemas?: Record<string, Schema>;
    parameters?: Record<string, Parameter>;
  };
};
export type Endpoint = Operation & {
  id: string;
  path: string;
  method: string;
  group: string;
  auth: "admin" | "app" | "public" | "oauth";
};
export function endpoints(spec: Spec): Endpoint[] {
  return Object.entries(spec.paths).flatMap(([path, operations]) =>
    Object.entries(operations)
      .filter(([method]) =>
        ["get", "post", "put", "patch", "delete", "head", "options"].includes(
          method,
        ),
      )
      .map(([method, op]) => ({
        ...op,
        parameters: [
          ...(Array.isArray(operations.parameters)
            ? (operations.parameters as unknown as Parameter[])
            : []),
          ...(op.parameters || []),
        ],
        path,
        method: method.toUpperCase(),
        id: btoa(`${method}:${path}`)
          .replaceAll("+", "-")
          .replaceAll("/", "_")
          .replaceAll("=", ""),
        group: path.startsWith("/api/v1/") ? path.split("/")[3] : "ops",
        auth: path.startsWith("/api/v1/auth/")
          ? ("oauth" as const)
          : /^\/api\/v1\/(apps|keys|cron)(\/|$)/.test(path)
            ? ("admin" as const)
            : /^\/api\/v1\/(audio|ingest|query|image|video|media|facebook)(\/|$)/.test(
                  path,
                )
              ? ("app" as const)
              : ("public" as const),
      })),
  );
}
export function resolveSchema(spec: Spec, schema: Schema = {}): Schema {
  if (schema.$ref)
    return spec.components?.schemas?.[schema.$ref.split("/").pop()!] || {};
  if (schema.anyOf)
    return resolveSchema(
      spec,
      schema.anyOf.find((s) => s.type !== "null") || {},
    );
  if (schema.allOf) return resolveSchema(spec, schema.allOf[0]);
  return schema;
}
export function example(spec: Spec, input: Schema = {}, depth = 0): unknown {
  if (depth > 5) return null;
  const schema = resolveSchema(spec, input);
  if (schema.default !== undefined) return schema.default;
  if (schema.enum) return schema.enum[0];
  if (schema.type === "object" || schema.properties)
    return Object.fromEntries(
      Object.entries(schema.properties || {})
        .filter(([key]) => !schema.required || schema.required.includes(key))
        .map(([key, s]) => [key, example(spec, s, depth + 1)]),
    );
  if (schema.type === "array") return [example(spec, schema.items, depth + 1)];
  if (schema.type === "integer" || schema.type === "number") return 1;
  if (schema.type === "boolean") return false;
  return "";
}
export function canExecute(
  user: {
    role: string;
    grants: string;
    page_permissions?: string;
    sections?: string[];
    components?: string[];
  },
  endpoint: Endpoint,
) {
  if (endpoint.auth === "oauth") return false;
  if (
    !canViewEndpoint(
      { ...user, page_permissions: user.page_permissions || "[]" },
      endpoint,
    )
  )
    return false;
  if (user.role === "admin") return true;
  if (user.role !== "operator" || endpoint.auth === "admin") return false;
  if (!hasComponent(user, "endpoint.execute")) return false;
  const component = (
    {
      POST: "endpoint.create",
      PUT: "endpoint.update",
      PATCH: "endpoint.update",
      DELETE: "endpoint.delete",
    } as Record<string, string>
  )[endpoint.method];
  if (component && !hasComponent(user, component)) return false;
  return (JSON.parse(user.grants) as string[]).includes(
    `${endpoint.method} ${endpoint.path}`,
  );
}
export function needsConfirmation(
  endpoint: Pick<Endpoint, "method" | "group">,
) {
  return (
    !["GET", "HEAD"].includes(endpoint.method) || endpoint.group === "cron"
  );
}
