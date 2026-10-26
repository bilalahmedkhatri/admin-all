"use client";
import { useTranslations } from "next-intl";

import { Form, Link, useFormNavigation } from "@/components/gateway/forms";
import {
  DataTable,
  Field,
  Notice,
  PageTitle,
  Submit,
} from "@/components/gateway/shared";
import { Badge } from "@/components/gateway/ui/badge";
import { Button } from "@/components/gateway/ui/button";
import { Card, CardContent } from "@/components/gateway/ui/card";
import { RequestAnalytics } from "@/components/gateway/request-analytics";
import type { loader } from "@/lib/gateway/services/requests";

type PageData = Exclude<Awaited<ReturnType<typeof loader>>, Response>;
const amount = (value: number | null | undefined) =>
  value == null ? "Unknown" : "$" + value.toFixed(6);
const seconds = (value: number | null | undefined) =>
  value == null ? "Unknown" : `${value.toFixed(2)}s`;
const text = (value: string | number | null | undefined) =>
  value ?? "Not recorded";
const utc = (value: string) => value.replace("T", " ").slice(0, 19);
export default function Requests({ data: pageData }: { data: PageData }) {
  const gatewayCopy = useTranslations("gateway.copy");

  const data = pageData;
  const detail = data.detail;
  const navigation = useFormNavigation();
  const pageLink = (page: number, recordId?: string) => {
    const query = new URLSearchParams({ ...data.filters, page: String(page) });
    if (recordId) query.set("record_id", recordId);
    return `?${query}${recordId ? "#request-detail" : ""}`;
  };
  return (
    <>
      <PageTitle
        title={gatewayCopy("m151")}
        description={gatewayCopy("m152")}
      />
      <Form
        key={new URLSearchParams(data.filters).toString()}
        method="get"
        className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          {
            name: "request_type",
            label: "Request type",
            values: ["query", "generate", "tts", "image", "video"],
          },
          {
            name: "status",
            label: "Status",
            values: [
              "queued",
              "processing",
              "completed",
              "failed",
              "cancelled",
              "rejected",
              "unknown",
            ],
          },
          {
            name: "page_size",
            label: "Rows per page",
            values: ["10", "20", "50", "100"],
          },
          { name: "view", label: "Display", values: ["both", "table"] },
        ].map((filter) => (
          <div className="space-y-2" key={filter.name}>
            <label
              htmlFor={`request-${filter.name}`}
              className="text-sm font-medium"
            >
              {filter.label}
            </label>
            <select
              id={`request-${filter.name}`}
              name={filter.name}
              defaultValue={data.filters[filter.name] ?? ""}
              className="flex h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white px-3 text-sm dark:bg-gray-900"
            >
              {!["page_size", "view"].includes(filter.name) && (
                <option value="">{gatewayCopy("m153")}</option>
              )}
              {filter.values.map((value) => (
                <option key={value} value={value}>
                  {filter.name === "view"
                    ? value === "both"
                      ? "Table and graphs"
                      : "Table only"
                    : value}
                </option>
              ))}
              {filter.name === "page_size" &&
                !filter.values.includes(data.filters.page_size) && (
                  <option>{data.filters.page_size}</option>
                )}
            </select>
          </div>
        ))}
        <Field
          name="search"
          label={gatewayCopy("m154")}
          defaultValue={data.filters.search}
          maxLength={128}
        />
        {[
          { name: "model", label: "Exact model" },
          { name: "provider", label: "Exact provider" },
        ].map((field) => (
          <Field
            key={field.name}
            {...field}
            defaultValue={data.filters[field.name]}
            maxLength={field.name === "model" ? 128 : 64}
          />
        ))}
        {[
          { name: "authorized_app_id", label: "App ID" },
          { name: "owner_user_id", label: "Backend owner ID" },
        ].map((field) => (
          <Field
            key={field.name}
            {...field}
            type="number"
            min={1}
            step={1}
            defaultValue={data.filters[field.name]}
          />
        ))}
        <Field
          name="date_from"
          label={gatewayCopy("m155")}
          type="date"
          defaultValue={data.filters.date_from}
        />
        <Field
          name="date_to"
          label={gatewayCopy("m156")}
          type="date"
          defaultValue={data.filters.date_to}
        />
        <div className="flex items-end gap-2">
          <Submit variant="outline">{gatewayCopy("m157")}</Submit>
          <Button asChild variant="ghost">
            <Link to="/requests">{gatewayCopy("m125")}</Link>
          </Button>
        </div>
      </Form>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {gatewayCopy("m158")}
        {utc(data.date_from)} {gatewayCopy("m159")}
        {utc(data.date_to)} {gatewayCopy("m160")}
      </p>
      {data.summaryError && <Notice error>{data.summaryError}</Notice>}
      {data.summary && <RequestAnalytics data={data.summary} />}
      <div aria-busy={navigation.state !== "idle"}>
        <DataTable
          rows={data.items}
          empty={gatewayCopy("m161")}
          columns={[
            {
              title: "Request / type",
              render: (row) => (
                <>
                  <Link
                    className="inline-block max-w-44 min-w-24 break-all underline"
                    to={pageLink(data.page, row.record_id)}
                  >
                    {row.record_id}
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {row.request_type}
                  </p>
                </>
              ),
            },
            {
              title: "Status",
              render: (row) => <Badge variant="outline">{row.status}</Badge>,
            },
            {
              title: "Model / provider",
              render: (row) => (
                <>
                  <span className="break-all">{text(row.model)}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {text(row.provider)}
                  </p>
                </>
              ),
            },
            {
              title: "App / owner",
              render: (row) => (
                <span>
                  {gatewayCopy("m162")}
                  {text(row.authorized_app_id)}
                  <br />
                  {gatewayCopy("m163")}
                  {text(row.owner_user_id)}
                </span>
              ),
            },
            {
              title: "Tokens in / out",
              render: (row) =>
                `${row.input_tokens ?? "?"} / ${row.output_tokens ?? "?"}`,
            },
            {
              title: "Processing time",
              render: (row) =>
                seconds(
                  row.duration_ms == null ? null : row.duration_ms / 1000,
                ),
            },
            {
              title: "Known provider estimate",
              render: (row) => (
                <span>
                  {amount(row.known_provider_cost_usd)}
                  {row.known_provider_cost_usd != null &&
                  row.provider_cost_complete !== true
                    ? " + unknown"
                    : ""}
                </span>
              ),
            },
            { title: "Created (UTC)", render: (row) => utc(row.created_at) },
          ]}
        />
      </div>
      <nav
        aria-label={gatewayCopy("m164")}
        className="my-5 flex flex-wrap items-center justify-between gap-3"
      >
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {gatewayCopy("m090")}
          {data.page} {gatewayCopy("m065")}
          {data.total} {gatewayCopy("m165")}
        </span>
        <div className="flex gap-3">
          {data.page > 1 && (
            <Button asChild variant="outline">
              <Link to={pageLink(data.page - 1)}>{gatewayCopy("m092")}</Link>
            </Button>
          )}
          {data.page * data.page_size < data.total && (
            <Button asChild variant="outline">
              <Link to={pageLink(data.page + 1)}>{gatewayCopy("m093")}</Link>
            </Button>
          )}
        </div>
      </nav>
      {data.detailError && <Notice error>{data.detailError}</Notice>}
      {detail && (
        <section
          id="request-detail"
          aria-labelledby="request-detail-title"
          className="scroll-mt-6 space-y-5"
        >
          <Card>
            <CardContent className="space-y-5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2
                  id="request-detail-title"
                  className="text-lg font-semibold break-all"
                >
                  {detail.record_id}
                </h2>
                <Button asChild variant="outline">
                  <Link to={pageLink(data.page)}>{gatewayCopy("m166")}</Link>
                </Button>
              </div>
              <dl className="grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-3">
                {[
                  [
                    "Type / status",
                    `${detail.request_type} / ${detail.status}`,
                  ],
                  ["Stored status", text(detail.source_status)],
                  [
                    "Model / provider",
                    `${text(detail.model)} / ${text(detail.provider)}`,
                  ],
                  ["Model provenance", text(detail.model_provenance)],
                  [
                    "Processing time",
                    seconds(
                      detail.duration_ms == null
                        ? null
                        : detail.duration_ms / 1000,
                    ),
                  ],
                  ["Timing source", text(detail.duration_source)],
                  [
                    "Known provider estimate",
                    `${amount(detail.known_provider_cost_usd)}${detail.known_provider_cost_usd != null && detail.provider_cost_complete !== true ? " + unknown" : ""}`,
                  ],
                  ["Accounting", text(detail.usage_accounting_status)],
                  [
                    "Customer tokens",
                    detail.customer_chargeable_tokens === 0
                      ? "0 (zero-charge policy; ledger not verified)"
                      : "Not reported",
                  ],
                  [
                    "App-provided user reference",
                    detail.external_user_id ??
                      "Not recorded; app is not a user",
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-gray-500 dark:text-gray-400">
                      {label}
                    </dt>
                    <dd className="font-medium break-words">{value}</dd>
                  </div>
                ))}
              </dl>
              {(detail.error_type || detail.error_code || detail.has_error) && (
                <Notice error>
                  {detail.error_type ?? "A generation error was recorded."}{" "}
                  {detail.error_code}
                </Notice>
              )}
              <details>
                <summary className="cursor-pointer font-medium">
                  {gatewayCopy("m167")}
                </summary>
                <div className="mt-3 space-y-4">
                  <div>
                    <h3 className="font-medium">{gatewayCopy("m168")}</h3>
                    <p className="max-h-64 overflow-auto break-words whitespace-pre-wrap">
                      {detail.input || "Body omitted or not recorded"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">{gatewayCopy("m169")}</h3>
                    <p className="max-h-64 overflow-auto break-words whitespace-pre-wrap">
                      {detail.output ??
                        "No text output. Media access remains in its authorized generation flow."}
                    </p>
                  </div>
                </div>
              </details>
              {detail.request_type === "tts" && (
                <p className="text-sm">
                  {gatewayCopy("m170")}
                  {text(detail.voice)} {gatewayCopy("m171")}{" "}
                  {seconds(detail.audio_duration_seconds)} {gatewayCopy("m172")}{" "}
                  {detail.size_bytes == null
                    ? "Unknown"
                    : `${(detail.size_bytes / 1048576).toFixed(2)} MiB`}
                </p>
              )}
              {["image", "video"].includes(detail.request_type) && (
                <p className="text-sm">
                  {gatewayCopy("m173")}
                  {text(detail.width)} {gatewayCopy("m174")}
                  {text(detail.height)} {gatewayCopy("m175")}
                  {seconds(detail.media_duration_seconds)} {gatewayCopy("m176")}
                  {text(detail.output_count)}
                </p>
              )}
            </CardContent>
          </Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {!detail.attempts_complete && "Attempt history is incomplete. "}
            {gatewayCopy("m177")}
          </p>
          {detail.chunks && (
            <>
              <h3 className="font-medium">
                {gatewayCopy("m178")}
                {detail.chunks.length}
                {gatewayCopy("m024")}
              </h3>
              <DataTable
                rows={detail.chunks}
                empty={gatewayCopy("m179")}
                columns={[
                  { title: "Part", render: (row) => row.index + 1 },
                  { title: "Status", render: (row) => row.status },
                  {
                    title: "Recorded chunk attempts",
                    render: (row) => row.recorded_chunk_attempts,
                  },
                  {
                    title: "Error recorded",
                    render: (row) => (row.has_error ? "Yes" : "No"),
                  },
                ]}
              />
            </>
          )}
          {detail.attempts && (
            <>
              <h3 className="font-medium">
                {gatewayCopy("m180")}
                {text(detail.attempts_source)}
                {gatewayCopy("m024")}
              </h3>
              <DataTable
                rows={detail.attempts}
                empty={gatewayCopy("m181")}
                columns={[
                  {
                    title: "Operation / attempt",
                    render: (row) => (
                      <>
                        {row.operation_id ??
                          row.kind ??
                          "chat selection / generation"}
                        {row.attempt_id && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {gatewayCopy("m182")}
                            {row.attempt_id.slice(0, 8)}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {row.started_at
                            ? utc(row.started_at) + " UTC"
                            : "Start not recorded"}
                        </p>
                      </>
                    ),
                  },
                  {
                    title: "Model / provider",
                    render: (row) =>
                      `${text(row.actual_model ?? row.model)} / ${text(row.provider)}`,
                  },
                  { title: "Status", render: (row) => text(row.status) },
                  {
                    title: "Time",
                    render: (row) =>
                      seconds(
                        row.elapsed_ms == null ? null : row.elapsed_ms / 1000,
                      ),
                  },
                  {
                    title: "Tokens in / out",
                    render: (row) =>
                      `${row.prompt_tokens ?? "?"} / ${row.completion_tokens ?? "?"}`,
                  },
                  { title: "Estimate", render: (row) => amount(row.cost_usd) },
                  {
                    title: "Error / HTTP status",
                    render: (row) =>
                      `${text(row.error_type ?? row.error_code)} / ${text(row.status_code)}`,
                  },
                ]}
              />
            </>
          )}
        </section>
      )}
    </>
  );
}
