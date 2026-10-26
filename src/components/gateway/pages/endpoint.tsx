"use client";
import { useTranslations } from "next-intl";

import {
  Form,
  Link,
  useFormResult,
  useFormNavigation,
} from "@/components/gateway/forms";
import { Loading } from "@/components/gateway/loading";
import { Play, ShieldCheck } from "@/components/gateway/icons";
import {
  example,
  needsConfirmation,
  resolveSchema,
  type Schema,
} from "@/lib/gateway/openapi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/gateway/ui/card";
import { Badge } from "@/components/gateway/ui/badge";
import { Button } from "@/components/gateway/ui/button";
import { Label } from "@/components/gateway/ui/label";
import {
  Field,
  Method,
  Notice,
  PageTitle,
  Submit,
  DataTable,
} from "@/components/gateway/shared";
import type { loader, action } from "@/lib/gateway/services/endpoint";

type PageData = Exclude<Awaited<ReturnType<typeof loader>>, Response>;
export default function EndpointPage({ data: pageData }: { data: PageData }) {
  const gatewayCopy = useTranslations("gateway.copy");

  const {
    endpoint: e,
    related,
    spec,
    live,
    error,
    allowed,
    credentials,
    admin,
  } = pageData;
  const result = useFormResult<typeof action>();
  const navigation = useFormNavigation();
  const busy = navigation.state !== "idle" && !!navigation.formMethod;
  const contentType = Object.keys(e.requestBody?.content || {})[0];
  const bodySchema = resolveSchema(
    spec,
    e.requestBody?.content[contentType]?.schema,
  );
  const properties = bodySchema.properties || {};
  const parameters = (e.parameters || []).filter(
    (p) => p.in === "path" || p.in === "query",
  );
  function field(
    name: string,
    schema: Schema,
    required: boolean,
    prefix: string,
    description?: string,
  ) {
    const s = resolveSchema(spec, schema);
    return (
      <Field
        key={prefix + name}
        label={name + (required ? " *" : "")}
        name={prefix + name}
        type={
          s.format === "binary"
            ? "file"
            : s.type === "integer" || s.type === "number"
              ? "number"
              : /secret|token|password|plain_key/i.test(name)
                ? "password"
                : "text"
        }
        required={required}
        defaultValue={s.default === undefined ? undefined : String(s.default)}
        placeholder={s.enum ? s.enum.join(" | ") : s.type || "value"}
        description={description || s.description}
      />
    );
  }
  return (
    <>
      <PageTitle
        title={e.summary || "API operation"}
        description={
          e.description?.slice(0, 500) ||
          "Configure this operation and review its response."
        }
      >
        <Badge variant="outline" className="gap-2 bg-white px-3 py-2">
          <ShieldCheck className="size-3" />
          {e.auth} {gatewayCopy("m094")}
        </Badge>
      </PageTitle>
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border bg-white p-4">
        <Method method={e.method} />
        <code className="text-sm break-all">{e.path}</code>
      </div>
      {related.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {related.map((op) => (
            <Button
              key={op.id}
              asChild
              variant={op.id === e.id ? "default" : "outline"}
              size="sm"
            >
              <Link to={`/endpoints/${op.id}`}>
                {op.method === "POST"
                  ? "Create / Run"
                  : op.method === "PATCH" || op.method === "PUT"
                    ? "Update"
                    : op.method === "DELETE"
                      ? "Delete / Revoke"
                      : "Read"}{" "}
                {gatewayCopy("m065")}
                {op.method}
              </Link>
            </Button>
          ))}
        </div>
      )}
      {error && <Notice error>{error}</Notice>}
      {!allowed && (
        <Notice>
          {e.auth === "oauth"
            ? "Google sign-in is handled by the backend authentication flow. This endpoint is documented only."
            : "Your role can view this endpoint. Request an operation grant from an administrator to execute it."}
        </Notice>
      )}
      {e.path === "/api/v1/keys/" && e.method === "POST" && (
        <Notice>{gatewayCopy("m095")}</Notice>
      )}
      {e.group === "apps" && <Notice>{gatewayCopy("m096")}</Notice>}
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{gatewayCopy("m097")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form
              key={e.id}
              method="post"
              encType="multipart/form-data"
              className="space-y-5"
            >
              <fieldset
                disabled={!allowed || !live}
                className="space-y-5 disabled:opacity-60"
              >
                {["admin", "app"].includes(e.auth) && (
                  <div className="space-y-2">
                    <Label htmlFor="credential">{gatewayCopy("m098")}</Label>
                    <select
                      name="credential"
                      id="credential"
                      className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white px-3 text-sm dark:bg-gray-900"
                    >
                      <option value="">
                        {admin
                          ? "Environment default"
                          : "Select an assigned app credential"}
                      </option>
                      {credentials.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {gatewayCopy("m099")}
                    </p>
                  </div>
                )}
                {parameters.map((p) =>
                  field(
                    p.name,
                    p.schema || {},
                    !!p.required,
                    `param:${p.in}:`,
                    p.description,
                  ),
                )}
                {contentType && (
                  <>
                    <input
                      type="hidden"
                      name="contentType"
                      value={contentType}
                    />
                    <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                      {gatewayCopy("m100")}
                      {contentType}
                    </p>
                    {contentType.includes("json") ? (
                      <Field
                        name="body"
                        label={gatewayCopy("m101")}
                        multiline
                        defaultValue={JSON.stringify(
                          example(
                            spec,
                            e.requestBody?.content[contentType].schema,
                          ),
                          null,
                          2,
                        )}
                        required
                      />
                    ) : (
                      Object.entries(properties).map(([name, schema]) =>
                        field(
                          name,
                          schema,
                          !!bodySchema.required?.includes(name),
                          "body:",
                        ),
                      )
                    )}
                  </>
                )}
                {!parameters.length && !contentType && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {gatewayCopy("m102")}
                  </p>
                )}
                {needsConfirmation(e) && (
                  <label className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                    <input
                      type="checkbox"
                      name="confirmed"
                      required
                      className="mt-1 accent-emerald-700"
                    />
                    {gatewayCopy("m103")}
                  </label>
                )}
                <Submit disabled={!allowed || !live}>
                  <Play className="me-2 size-3.5" />
                  {gatewayCopy("m104")}
                  {e.method} {gatewayCopy("m105")}
                </Submit>
              </fieldset>
            </Form>
          </CardContent>
        </Card>
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{gatewayCopy("m106")}</CardTitle>
            </CardHeader>
            <CardContent>
              {busy ? (
                <Loading kind="section" label={gatewayCopy("m107")} />
              ) : result ? (
                <>
                  {result.error && <Notice error>{result.error}</Notice>}
                  <div className="mb-4 flex gap-2">
                    <Badge variant="outline">
                      {gatewayCopy("m108")}
                      {result.status}
                    </Badge>
                    <Badge variant="secondary">
                      {result.elapsed} {gatewayCopy("m109")}
                    </Badge>
                  </div>
                  {result.result !== null && (
                    <ResponsePreview value={result.result} />
                  )}
                </>
              ) : (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <BracesIcon />
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    {gatewayCopy("m110")}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {gatewayCopy("m111")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{gatewayCopy("m112")}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-64 overflow-auto rounded-lg bg-gray-50 p-4 text-theme-xs leading-6 dark:bg-white/5">
                {JSON.stringify(contentType ? bodySchema : parameters, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
function BracesIcon() {
  return (
    <code className="text-xl text-gray-500 dark:text-gray-400">{"{ }"}</code>
  );
}
function ResponsePreview({ value }: { value: unknown }) {
  const gatewayCopy = useTranslations("gateway.copy");

  const lists = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? Object.values(value).find(Array.isArray)
      : undefined;
  const rows = Array.isArray(lists)
    ? (lists
        .filter((r) => r && typeof r === "object" && !Array.isArray(r))
        .slice(0, 100) as Record<string, unknown>[])
    : [];
  const keys = [...new Set(rows.flatMap(Object.keys))].slice(0, 8);
  const raw = (
    <pre className="max-h-[520px] overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-200">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
  return rows.length ? (
    <>
      <DataTable
        rows={rows}
        columns={keys.map((key) => ({
          title: key,
          render: (row: Record<string, unknown>) => (
            <span
              className="block max-w-64 truncate text-xs"
              title={JSON.stringify(row[key])}
            >
              {typeof row[key] === "object"
                ? JSON.stringify(row[key])
                : String(row[key] ?? "No value")}
            </span>
          ),
        }))}
      />
      <p className="my-3 text-xs text-gray-500 dark:text-gray-400">
        {gatewayCopy("m113")}
      </p>
      <details>
        <summary className="mb-3 cursor-pointer text-xs text-brand-500">
          {gatewayCopy("m114")}
        </summary>
        {raw}
      </details>
    </>
  ) : (
    raw
  );
}
