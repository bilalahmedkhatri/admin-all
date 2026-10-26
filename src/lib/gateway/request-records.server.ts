import "server-only";
import { backend } from "./backend.server";
import { z } from "zod";

export type RequestRecord = {
  record_id: string;
  native_id: string;
  request_type: string;
  authorized_app_id: number | null;
  owner_user_id: number | null;
  external_user_id: string | null;
  status: string;
  source_status: string | null;
  created_at: string;
  duration_ms: number | null;
  duration_source: string;
  model: string | null;
  provider: string | null;
  model_provenance: string;
  input_tokens: number | null;
  output_tokens: number | null;
  known_provider_cost_usd: number | null;
  provider_cost_complete: boolean | null;
  usage_accounting_status: string | null;
  customer_chargeable_tokens: number | null;
  customer_tokens_basis: string;
};
export type RequestDetail = RequestRecord & {
  input?: string;
  output?: string | null;
  voice?: string | null;
  audio_duration_seconds?: number | null;
  media_duration_seconds?: number | null;
  size_bytes?: number | null;
  width?: number | null;
  height?: number | null;
  output_count?: number;
  has_error?: boolean;
  error_type?: string | null;
  error_code?: string | null;
  attempts_complete: boolean;
  attempts_source?: string;
  attempts?: {
    attempt_id?: string;
    operation_id?: string;
    started_at?: string;
    finished_at?: string;
    kind?: string;
    model?: string;
    actual_model?: string;
    provider?: string;
    status?: string;
    error_type?: string;
    error_code?: string;
    status_code?: number;
    elapsed_ms?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
    cost_usd?: number;
  }[];
  chunks?: {
    index: number;
    status: string;
    recorded_chunk_attempts: number;
    has_error: boolean;
  }[];
};
const count = z.number().int().nonnegative();
const measurement = z.number().finite().nonnegative().nullable();
const measures = {
  requests: count,
  success_rate: z.number().min(0).max(100).nullable(),
  average_duration_ms: measurement,
  duration_samples: count,
  known_provider_cost_usd: measurement,
  cost_samples: count,
  complete_cost_requests: count,
  recorded_input_tokens: measurement,
  recorded_output_tokens: measurement,
  input_token_samples: count,
  output_token_samples: count,
};
const breakdown = z.array(z.object({ value: z.string().nullable(), count }));
const summarySchema = z.object({
  ...measures,
  date_from: z.string().datetime({ offset: true }),
  date_to: z.string().datetime({ offset: true }),
  breakdowns: z.object({
    status: breakdown,
    request_type: breakdown,
    model: breakdown,
    provider: breakdown,
  }),
  series: z
    .array(
      z.object({
        ...measures,
        day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        completed: count,
        failed: count,
      }),
    )
    .max(367),
});
export type RequestSummary = z.infer<typeof summarySchema>;

export async function requestRecords(request: Request) {
  const params = new URL(request.url).searchParams;
  const bounded = (name: string, fallback: number, maximum: number) =>
    Math.max(
      1,
      Math.min(maximum, Math.floor(Number(params.get(name)) || fallback)),
    );
  const page = bounded("page", 1, 100000);
  const filters: Record<string, string> = {
    page_size: String(bounded("page_size", 20, 100)),
  };
  for (const name of [
    "request_type",
    "status",
    "model",
    "provider",
    "authorized_app_id",
    "owner_user_id",
    "search",
    "date_from",
    "date_to",
  ]) {
    const value = params.get(name)?.trim();
    if (value) filters[name] = value;
  }
  const query = new URLSearchParams({ ...filters, page: String(page) });
  const showGraphs = params.get("view") !== "table";
  filters.view = showGraphs ? "both" : "table";
  for (const name of ["date_from", "date_to"]) {
    if (filters[name]) {
      const value = filters[name];
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        Number.isNaN(Date.parse(`${value}T00:00:00Z`)) ||
        new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value
      )
        throw new Response("Use valid UTC calendar dates", { status: 422 });
      query.set(name, `${value}T00:00:00Z`);
    }
  }
  // Both requests share exact boundaries, including when the user leaves dates blank.
  const end = query.get("date_to") || new Date().toISOString();
  query.set("date_to", end);
  query.set(
    "date_from",
    query.get("date_from") ||
      new Date(Date.parse(end) - 30 * 86400000).toISOString(),
  );
  const summaryQuery = new URLSearchParams(query);
  summaryQuery.delete("page");
  summaryQuery.delete("page_size");
  // Preserve old bookmarked query links without retaining the old API dependency.
  const legacy = params.get("query_id");
  const recordId =
    params.get("record_id") ||
    (legacy && /^\d+$/.test(legacy) ? `query:${legacy}` : "");
  const validId =
    /^(?:(?:query|media):[1-9]\d{0,18}|tts:[A-Za-z0-9_-]{1,64})$/.test(
      recordId,
    );
  let detailError: string | null =
    recordId && !validId ? "Invalid request reference." : null;
  const [listing, detail, summary] = await Promise.all([
    backend<{
      items: RequestRecord[];
      total: number;
      page: number;
      page_size: number;
      date_from: string;
      date_to: string;
    }>(request, `/requests?${query}`),
    validId
      ? backend<RequestDetail>(
          request,
          `/requests/${encodeURIComponent(recordId)}`,
        ).catch((error) => {
          if (
            !(error instanceof Response) ||
            error.status === 401 ||
            error.status === 403
          )
            throw error;
          detailError =
            error.status === 404
              ? "Selected request was not found."
              : "Request details are unavailable. Refresh to retry.";
          return null;
        })
      : null,
    showGraphs
      ? backend<RequestSummary>(
          request,
          `/requests/summary?${summaryQuery}`,
        ).catch((error) => {
          if (error instanceof Response && [401, 403].includes(error.status))
            throw error;
          return null;
        })
      : null,
  ]);
  const parsedSummary = summarySchema.safeParse(summary);
  const supportedSummary = parsedSummary.success ? parsedSummary.data : null;
  return {
    ...listing,
    filters,
    detail,
    detailError,
    summary: supportedSummary,
    summaryError:
      showGraphs && !supportedSummary
        ? "Graphs are unavailable. The request table is still available; refresh to retry."
        : null,
  };
}
