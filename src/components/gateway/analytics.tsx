"use client";
import { useTranslations } from "next-intl";

import { Form } from "@/components/gateway/forms";
import { Chart } from "@/components/gateway/chart";
import { Card, CardContent } from "@/components/gateway/ui/card";
import { PageTitle, DataTable } from "@/components/gateway/shared";
export type Analytics = {
  days: number;
  scope: string;
  requests: number;
  errors: number;
  success_rate: number | null;
  error_rate: number | null;
  latency_ms: number | null;
  latency_samples: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    cost_usd: number | null;
    token_samples: number;
    cost_samples: number;
    query_responses: number;
  } | null;
  series: {
    day: string;
    requests: number;
    success: number;
    errors: number;
    latency_ms: number | null;
    prompt_tokens: number;
    completion_tokens: number;
    cost_usd: number | null;
    token_samples: number;
  }[];
};
const count = (value: number) => value.toLocaleString();
const money = (value: number | null) =>
  value === null ? "Not recorded" : `$${value.toFixed(4)}`;
export function AnalyticsPanel({ data: d }: { data: Analytics }) {
  const gatewayCopy = useTranslations("gateway.copy");

  const dates = d.series.map((p) => p.day);
  const cards = [
    { label: "Executed requests", value: count(d.requests) },
    {
      label: "Success rate",
      value:
        d.success_rate === null
          ? "No requests"
          : `${d.success_rate.toFixed(1)}%`,
    },
    {
      label: "Error rate",
      value:
        d.error_rate === null
          ? "No requests"
          : `${d.error_rate.toFixed(1)}% (${count(d.errors)})`,
    },
    {
      label: "Average latency",
      value:
        d.latency_ms === null
          ? "Not recorded"
          : `${d.latency_ms.toFixed(0)} ms`,
    },
  ];
  if (d.usage)
    cards.push(
      {
        label: "Recorded query tokens",
        value: d.usage.token_samples
          ? count(d.usage.prompt_tokens + d.usage.completion_tokens)
          : "Not recorded",
      },
      { label: "Reported query cost", value: money(d.usage.cost_usd) },
    );
  return (
    <section className="mb-8" aria-label={gatewayCopy("m001")}>
      <PageTitle
        title={gatewayCopy("m001")}
        description={`${d.scope}. Daily buckets use UTC.`}
      >
        <Form method="get">
          <label className="sr-only" htmlFor="analytics-days">
            {gatewayCopy("m002")}
          </label>
          <select
            key={d.days}
            id="analytics-days"
            name="days"
            defaultValue={d.days}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {[7, 30, 90].map((days) => (
              <option key={days} value={days}>
                {gatewayCopy("m003")}
                {days} {gatewayCopy("m004")}
              </option>
            ))}
          </select>
        </Form>
      </PageTitle>
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-5">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {c.label}
              </p>
              <p className="mt-3 text-2xl font-semibold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mb-5 text-xs leading-6 text-gray-500 dark:text-gray-400">
        {gatewayCopy("m005")}
        {count(d.latency_samples)} {gatewayCopy("m006")}
        {d.usage &&
          ` Token and cost data cover recorded query responses across the gateway; they exclude unrecorded provider usage and are not a billing total. Cost is present for ${count(
            d.usage.cost_samples,
          )} of ${count(d.usage.query_responses)} query responses.`}
      </p>
      <div className="grid gap-5 lg:grid-cols-2">
        <Chart
          title={gatewayCopy("m007")}
          values={d.series.map((p) => p.requests)}
          dates={dates}
        />
        <Chart
          title={gatewayCopy("m008")}
          values={d.series.map((p) => p.latency_ms)}
          dates={dates}
          unit="ms"
        />
        {d.usage && (
          <>
            <Chart
              title={gatewayCopy("m009")}
              values={d.series.map((p) =>
                p.token_samples ? p.prompt_tokens + p.completion_tokens : null,
              )}
              dates={dates}
              unit="tokens"
              showDataLabels={false}
            />
            <Chart
              title={gatewayCopy("m010")}
              values={d.series.map((p) => p.cost_usd)}
              dates={dates}
              unit="USD"
              showDataLabels={false}
            />
          </>
        )}
      </div>
      <details className="mt-5">
        <summary className="cursor-pointer text-sm text-brand-500">
          {gatewayCopy("m011")}
        </summary>
        <div className="mt-4">
          <DataTable
            rows={d.series}
            columns={[
              { title: "Date (UTC)", render: (p) => p.day },
              { title: "Requests", render: (p) => count(p.requests) },
              { title: "Success", render: (p) => count(p.success) },
              { title: "Errors", render: (p) => count(p.errors) },
              {
                title: "Avg latency",
                render: (p) =>
                  p.latency_ms === null
                    ? "Not recorded"
                    : `${p.latency_ms.toFixed(0)} ms`,
              },
              ...(d.usage
                ? [
                    {
                      title: "Input tokens",
                      render: (p: Analytics["series"][number]) =>
                        p.token_samples
                          ? count(p.prompt_tokens)
                          : "Not recorded",
                    },
                    {
                      title: "Output tokens",
                      render: (p: Analytics["series"][number]) =>
                        p.token_samples
                          ? count(p.completion_tokens)
                          : "Not recorded",
                    },
                    {
                      title: "Cost (USD)",
                      render: (p: Analytics["series"][number]) =>
                        money(p.cost_usd),
                    },
                  ]
                : []),
            ]}
          />
        </div>
      </details>
    </section>
  );
}
