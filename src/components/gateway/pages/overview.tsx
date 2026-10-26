"use client";
import { useTranslations } from "next-intl";

import { Link, useRefresh } from "@/components/gateway/forms";
import {
  ArrowUpRight,
  Braces,
  KeyRound,
  RefreshCw,
  Users,
  Workflow,
} from "@/components/gateway/icons";
import { Loading } from "@/components/gateway/loading";
import { AnalyticsPanel } from "@/components/gateway/analytics";
import { Button } from "@/components/gateway/ui/button";
import { Card, CardContent } from "@/components/gateway/ui/card";
import { Badge } from "@/components/gateway/ui/badge";
import {
  DataTable,
  Method,
  Notice,
  PageTitle,
} from "@/components/gateway/shared";
import type { loader } from "@/lib/gateway/services/overview";

import type { OverviewSection } from "@/lib/gateway/overview-navigation";

type PageData = Exclude<Awaited<ReturnType<typeof loader>>, Response>;
export default function Overview({
  data: pageData,
  section = "summary",
}: {
  data: PageData;
  section?: OverviewSection;
}) {
  const gatewayCopy = useTranslations("gateway.copy");
  const loadingCopy = useTranslations("gateway");

  const d = pageData;
  const revalidator = useRefresh();
  const stats = [
    {
      title: "API operations",
      value: d.all.length,
      detail: "Discovered from gateway",
      icon: Braces,
    },
    {
      title: "Collections",
      value: d.groups.length,
      detail: "Across your AI stack",
      icon: Workflow,
    },
    ...(d.team
      ? [
          {
            title: "Team members",
            value: d.team.count,
            detail: `${d.team.pending || 0} awaiting approval`,
            icon: Users,
          },
          {
            title: "Saved credentials",
            value: d.keys || 0,
            detail: "Encrypted at rest",
            icon: KeyRound,
          },
        ]
      : []),
  ];
  return (
    <>
      {section !== "analytics" && (
        <PageTitle
          title={
            section === "summary"
              ? `Welcome back, ${d.name}`
              : section === "collections"
                ? gatewayCopy("m133")
                : section === "recent-activity"
                  ? gatewayCopy("m137")
                  : gatewayCopy("m001")
          }
          description={gatewayCopy("m131")}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => revalidator.revalidate()}
            disabled={revalidator.state !== "idle"}
          >
            {revalidator.state !== "idle" ? (
              <Loading kind="button" label={loadingCopy("refreshing")} />
            ) : (
              <>
                <RefreshCw className="me-2 size-3.5" />
                {gatewayCopy("m132")}
              </>
            )}
          </Button>
        </PageTitle>
      )}
      {d.error && <Notice error>{d.error}</Notice>}
      {section === "summary" && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.title}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {s.title}
                  </p>
                  <s.icon className="size-5 shrink-0 text-gray-500 dark:text-gray-400" />
                </div>
                <p className="mt-5 text-3xl font-semibold tracking-tight">
                  {s.value}
                </p>
                <p className="mt-2 text-theme-xs text-gray-500 dark:text-gray-400">
                  {s.detail}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {section === "summary" && (
        <div className="grid gap-4 sm:grid-cols-3">
          {d.showEndpoints && (
            <Link
              to="/overview/collections"
              className="menu-item rounded-xl border border-gray-200 menu-item-inactive dark:border-gray-800"
            >
              {gatewayCopy("m133")}
              <ArrowUpRight className="ms-auto size-4 shrink-0" />
            </Link>
          )}
          <Link
            to="/overview/analytics"
            className="menu-item rounded-xl border border-gray-200 menu-item-inactive dark:border-gray-800"
          >
            {gatewayCopy("m001")}
            <ArrowUpRight className="ms-auto size-4 shrink-0" />
          </Link>
          {d.showActivity && (
            <Link
              to="/overview/recent-activity"
              className="menu-item rounded-xl border border-gray-200 menu-item-inactive dark:border-gray-800"
            >
              {gatewayCopy("m137")}
              <ArrowUpRight className="ms-auto size-4 shrink-0" />
            </Link>
          )}
        </div>
      )}
      {section === "collections" && d.showEndpoints && (
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">{gatewayCopy("m133")}</h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {gatewayCopy("m134")}
              </p>
            </div>
            <Link
              to="/endpoints"
              className="flex items-center gap-1 text-xs text-brand-500"
            >
              {gatewayCopy("m135")}
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {d.groups.map((group) => (
              <Link
                key={group}
                to={`/endpoints?group=${encodeURIComponent(group)}`}
                className="group hover:border-primary/40 dark:bg-brand-500/10/30 flex items-center justify-between rounded-lg border bg-white p-4 transition-colors hover:bg-brand-50"
              >
                <div>
                  <p className="text-sm font-medium capitalize">{group}</p>
                  <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
                    {d.all.filter((e) => e.group === group).length}{" "}
                    {gatewayCopy("m117")}
                  </p>
                </div>
                <ArrowUpRight className="size-4 text-gray-500 group-hover:text-brand-500 dark:text-gray-400" />
              </Link>
            ))}
          </div>
        </section>
      )}
      {section === "analytics" &&
        (d.analytics ? (
          <AnalyticsPanel data={d.analytics} />
        ) : (
          <Notice error>{gatewayCopy("m136")}</Notice>
        ))}
      {section === "recent-activity" && d.showActivity && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">{gatewayCopy("m137")}</h2>
            <Link to="/activity" className="text-xs text-brand-500">
              {gatewayCopy("m138")}
            </Link>
          </div>
          <DataTable
            rows={d.activity}
            empty={gatewayCopy("m139")}
            columns={[
              {
                title: "Operation",
                render: (r) => <Method method={r.action} />,
              },
              {
                title: "Target",
                render: (r) => <code className="text-xs">{r.target}</code>,
              },
              {
                title: "Result",
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
        </>
      )}
    </>
  );
}
