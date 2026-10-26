"use client";
import { useTranslations } from "next-intl";

import { Link } from "@/components/gateway/forms";
import { Badge } from "@/components/gateway/ui/badge";
import { Button } from "@/components/gateway/ui/button";
import { DataTable, PageTitle } from "@/components/gateway/shared";
import type { loader } from "@/lib/gateway/services/activity";

type PageData = Exclude<Awaited<ReturnType<typeof loader>>, Response>;
export default function Activity({ data: pageData }: { data: PageData }) {
  const gatewayCopy = useTranslations("gateway.copy");

  const d = pageData;
  return (
    <>
      <PageTitle
        title={gatewayCopy("m087")}
        description={gatewayCopy("m088")}
      />
      <DataTable
        rows={d.rows}
        columns={[
          { title: "Member", render: (r) => r.name },
          {
            title: "Action",
            render: (r) => <code className="text-xs">{r.action}</code>,
          },
          {
            title: "Target",
            render: (r) => (
              <code className="text-xs break-all">{r.target}</code>
            ),
          },
          {
            title: "Status",
            render: (r) => <Badge variant="outline">{r.status}</Badge>,
          },
          {
            title: "Time",
            render: (r) => (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {r.created_at.replace("T", " ").slice(0, 19)}{" "}
                {gatewayCopy("m089")}
              </span>
            ),
          },
        ]}
      />
      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {gatewayCopy("m090")}
          {d.page} {gatewayCopy("m065")}
          {d.count} {gatewayCopy("m091")}
        </p>
        <div className="flex gap-2">
          {d.page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`?page=${d.page - 1}`}>{gatewayCopy("m092")}</Link>
            </Button>
          )}
          {d.page * 25 < d.count && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`?page=${d.page + 1}`}>{gatewayCopy("m093")}</Link>
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
