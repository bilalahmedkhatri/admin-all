"use client";
import { useTranslations } from "next-intl";

import { useState } from "react";
import type { RequestSummary } from "@/lib/gateway/request-records.server";
import { Chart, metric } from "@/components/gateway/chart";
import { DataTable } from "@/components/gateway/shared";
import { Card, CardContent } from "@/components/gateway/ui/card";

const trends = [
  { key: "requests", title: "Daily parent requests", unit: "" },
  { key: "completed", title: "Daily completed requests", unit: "" },
  { key: "failed", title: "Daily failed requests", unit: "" },
  { key: "success_rate", title: "Daily terminal success rate", unit: "%" },
  {
    key: "average_duration_ms",
    title: "Daily average recorded processing time",
    unit: "ms",
  },
  {
    key: "recorded_input_tokens",
    title: "Daily recorded response input tokens",
    unit: "tokens",
  },
  {
    key: "recorded_output_tokens",
    title: "Daily recorded response output tokens",
    unit: "tokens",
  },
  {
    key: "known_provider_cost_usd",
    title: "Daily known provider-cost subtotal",
    unit: "USD",
  },
] as const;

export function RequestAnalytics({ data: d }: { data: RequestSummary }) {
  const gatewayCopy = useTranslations("gateway.copy");

  const [selected, setSelected] = useState<string>("requests");
  const trend = trends.find((t) => t.key === selected) ?? trends[0];
  const count = (status: string) =>
    d.breakdowns.status.find((row) => row.value === status)?.count ?? 0;
  const cards = [
    ["Parent requests", metric(d.requests)],
    ["Completed", metric(count("completed"))],
    ["Failed", metric(count("failed"))],
    ["Terminal success rate", metric(d.success_rate, "%")],
    ["Average recorded processing time", metric(d.average_duration_ms, "ms")],
    ["Known provider-cost subtotal", metric(d.known_provider_cost_usd, "USD")],
  ];
  return (
    <section
      className="mb-6 min-w-0 space-y-4"
      aria-labelledby="ai-analytics-title"
    >
      <h2 id="ai-analytics-title" className="text-lg font-semibold">
        {gatewayCopy("m254")}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {gatewayCopy("m255")}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {label}
              </p>
              <p className="mt-2 text-xl font-semibold break-words tabular-nums">
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs leading-6 text-gray-500 dark:text-gray-400">
        {gatewayCopy("m256")}
        {metric(d.duration_samples)} {gatewayCopy("m257")}
        {metric(d.requests)} {gatewayCopy("m258")}
        {metric(d.input_token_samples)} {gatewayCopy("m257")}{" "}
        {metric(d.output_token_samples)}
        {gatewayCopy("m259")}
        {metric(d.cost_samples)}
        {gatewayCopy("m260")}
        {metric(d.complete_cost_requests)} {gatewayCopy("m257")}{" "}
        {metric(d.requests)} {gatewayCopy("m261")}
      </p>
      <div className="space-y-2">
        <label htmlFor="ai-trend" className="text-sm font-medium">
          {gatewayCopy("m262")}
        </label>
        <select
          id="ai-trend"
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
          className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white px-3 text-sm sm:max-w-md dark:bg-gray-900"
        >
          {trends.map((t) => (
            <option key={t.key} value={t.key}>
              {t.title}
            </option>
          ))}
        </select>
      </div>
      <Chart
        title={trend.title}
        values={d.series.map((point) => point[trend.key])}
        dates={d.series.map((point) => point.day)}
        unit={trend.unit}
      />
      <details>
        <summary className="cursor-pointer text-sm font-medium">
          {gatewayCopy("m263")}
        </summary>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {(
            [
              ["model", "Parent count by model"],
              ["provider", "Parent count by provider"],
              ["request_type", "Parent count by request type"],
              ["status", "Parent count by status"],
            ] as const
          ).map(([key, title]) => (
            <Chart
              key={key}
              title={title}
              variant="bar"
              values={d.breakdowns[key].map((row) => row.count)}
              dates={d.breakdowns[key].map(
                (row) => row.value ?? "Not recorded",
              )}
            />
          ))}
        </div>
      </details>
      <details>
        <summary className="cursor-pointer text-sm font-medium">
          {gatewayCopy("m264")}
        </summary>
        <div className="mt-4">
          <DataTable
            rows={d.series}
            columns={[
              { title: "UTC date", render: (row) => row.day },
              { title: "Requests", render: (row) => metric(row.requests) },
              {
                title: "Completed / failed",
                render: (row) =>
                  `${metric(row.completed)} / ${metric(row.failed)}`,
              },
              {
                title: "Success rate",
                render: (row) => metric(row.success_rate, "%"),
              },
              {
                title: "Average time / samples",
                render: (row) =>
                  `${metric(row.average_duration_ms, "ms")} / ${metric(row.duration_samples)}`,
              },
              {
                title: "Input / output tokens",
                render: (row) =>
                  `${metric(row.recorded_input_tokens)} / ${metric(row.recorded_output_tokens)}`,
              },
              {
                title: "Input / output samples",
                render: (row) =>
                  `${metric(row.input_token_samples)} / ${metric(row.output_token_samples)}`,
              },
              {
                title: "Known cost / samples",
                render: (row) =>
                  `${metric(row.known_provider_cost_usd, "USD")} / ${metric(row.cost_samples)}`,
              },
              {
                title: "Complete-cost parents",
                render: (row) => metric(row.complete_cost_requests),
              },
            ]}
          />
        </div>
      </details>
    </section>
  );
}
