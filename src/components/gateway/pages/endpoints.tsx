"use client";
import { useTranslations } from "next-intl";

import { Form, Link, useFeatureSearch } from "@/components/gateway/forms";
import { ArrowUpRight, Search } from "@/components/gateway/icons";
import {
  DataTable,
  Method,
  Notice,
  PageTitle,
} from "@/components/gateway/shared";
import { Input } from "@/components/gateway/ui/input";
import { Badge } from "@/components/gateway/ui/badge";
import { Button } from "@/components/gateway/ui/button";
import type { loader } from "@/lib/gateway/services/endpoints";

type PageData = Exclude<Awaited<ReturnType<typeof loader>>, Response>;
export default function Endpoints({ data: pageData }: { data: PageData }) {
  const gatewayCopy = useTranslations("gateway.copy");

  const { all, error } = pageData;
  const [search] = useFeatureSearch();
  const q = search.get("q")?.toLowerCase() || "";
  const group = search.get("group") || "";
  const method = search.get("method") || "";
  const rows = all.filter(
    (e) =>
      (!group || e.group === group) &&
      (!method || e.method === method) &&
      `${e.path} ${e.summary}`.toLowerCase().includes(q),
  );
  return (
    <>
      <PageTitle title={gatewayCopy("m115")} description={gatewayCopy("m116")}>
        <Badge variant="outline" className="bg-white px-3 py-2">
          {all.length} {gatewayCopy("m117")}
        </Badge>
      </PageTitle>
      {error && <Notice error>{error}</Notice>}
      <Form method="get" className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute start-3 top-3 size-4 text-gray-500 dark:text-gray-400" />
          <Input
            name="q"
            aria-label={gatewayCopy("m118")}
            placeholder={gatewayCopy("m119")}
            defaultValue={q}
            className="bg-white ps-9"
          />
        </div>
        <select
          name="group"
          aria-label={gatewayCopy("m120")}
          defaultValue={group}
          className="h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white px-3 text-sm"
        >
          <option value="">{gatewayCopy("m121")}</option>
          {[...new Set(all.map((e) => e.group))].map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select
          name="method"
          aria-label={gatewayCopy("m122")}
          defaultValue={method}
          className="h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white px-3 text-sm"
        >
          <option value="">{gatewayCopy("m123")}</option>
          {[...new Set(all.map((e) => e.method))].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <Button type="submit" variant="secondary">
          {gatewayCopy("m124")}
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/endpoints">{gatewayCopy("m125")}</Link>
        </Button>
      </Form>
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        {rows.length} {gatewayCopy("m126")}
      </p>
      <DataTable
        rows={rows}
        empty={gatewayCopy("m127")}
        columns={[
          { title: "Method", render: (e) => <Method method={e.method} /> },
          {
            title: "Endpoint",
            render: (e) => (
              <Link to={`/endpoints/${e.id}`} className="block">
                <code className="text-xs font-medium break-all">{e.path}</code>
                <p className="mt-1 max-w-md text-xs text-gray-500 dark:text-gray-400">
                  {e.summary || "API operation"}
                </p>
              </Link>
            ),
          },
          {
            title: "Collection",
            render: (e) => (
              <span className="text-xs capitalize">{e.group}</span>
            ),
          },
          {
            title: "Access",
            render: (e) => (
              <Badge variant="outline" className="text-theme-xs">
                {e.auth === "oauth"
                  ? "Gateway OAuth"
                  : e.auth === "admin"
                    ? "Admin secret"
                    : e.auth === "app"
                      ? "App key"
                      : "Public"}
              </Badge>
            ),
          },
          {
            title: "Manage",
            render: (e) => (
              <Button variant="ghost" size="icon" asChild>
                <Link
                  to={`/endpoints/${e.id}`}
                  aria-label={`Manage ${e.method} ${e.path}`}
                >
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            ),
          },
        ]}
      />
    </>
  );
}
