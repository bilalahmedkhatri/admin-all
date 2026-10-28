import { pageRequest } from "@/lib/gateway/runtime.server";
import { fetchPrompts, type PromptItem } from "@/lib/gateway/prompts.server";
import { Link } from "@/i18n/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";

export const dynamic = "force-dynamic";

const CATEGORY_COLORS: Record<string, "primary" | "info" | "success" | "warning" | "dark" | "light"> = {
  "Audio Generation": "primary",
  "Video Generation": "info",
  "Blog Generation": "success",
  "Image Generation": "warning",
  "Cover Letter": "dark",
  "Social Media Copy": "light",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return iso.slice(0, 10);
}

export default async function PromptsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const page = Math.max(1, parseInt(String(query.page ?? "1"), 10) || 1);

  let data: Awaited<ReturnType<typeof fetchPrompts>> | null = null;
  let error: string | null = null;

  try {
    const request = await pageRequest("/Prompts/list");
    data = await fetchPrompts(request, page);
  } catch (e) {
    error = e instanceof Response ? await e.text().catch(() => "Failed to load prompts") : "Failed to load prompts";
  }

  const cell = "px-5 py-4 text-start text-sm";

  const prevHref = `/Prompts/list?page=${page - 1}`;
  const nextHref = `/Prompts/list?page=${page + 1}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      {error ? (
        <div className="px-6 py-12 text-center text-sm text-red-500">{error}</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
                <TableRow>
                  <TableCell isHeader className={`${cell} font-medium`}>Title</TableCell>
                  <TableCell isHeader className={`${cell} font-medium`}>Use Case</TableCell>
                  <TableCell isHeader className={`${cell} font-medium`}>Author</TableCell>
                  <TableCell isHeader className={`${cell} font-medium`}>Prompt Preview</TableCell>
                  <TableCell isHeader className={`${cell} font-medium whitespace-nowrap`}>Created</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {!data || data.items.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-5 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                      No prompts found. <Link href="/Prompts/new" className="text-brand-500 hover:underline">Create one →</Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.items.map((prompt: PromptItem) => (
                    <TableRow
                      key={prompt.id}
                      className="transition-colors hover:bg-gray-50/60 dark:hover:bg-white/[0.02]"
                    >
                      <TableCell className={`${cell} max-w-xs font-medium`}>
                        <Link
                          href={`/Prompts/new?id=${prompt.id}`}
                          className="text-gray-900 transition hover:text-brand-500 dark:text-white dark:hover:text-brand-400"
                        >
                          {prompt.title}
                        </Link>
                      </TableCell>
                      <TableCell className={`${cell} whitespace-nowrap`}>
                        <Badge size="sm" color={CATEGORY_COLORS[prompt.category] ?? "light"}>
                          {prompt.category}
                        </Badge>
                      </TableCell>
                      <TableCell className={`${cell} whitespace-nowrap`}>
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                            {prompt.author_name.charAt(0).toUpperCase()}
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {prompt.author_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className={`${cell} max-w-md text-gray-600 dark:text-gray-300`}>
                        <p className="line-clamp-2 leading-relaxed">
                          {prompt.content.replace(/^#+ /gm, "").replace(/\*\*/g, "")}
                        </p>
                      </TableCell>
                      <TableCell className={`${cell} whitespace-nowrap text-gray-500 dark:text-gray-400`}>
                        {formatDate(prompt.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination — no page count shown */}
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-800">
            {data?.has_prev ? (
              <Link
                href={prevHref}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Previous
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-400 shadow-theme-xs opacity-40 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800">
                Previous
              </span>
            )}

            {data?.has_next ? (
              <Link
                href={nextHref}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Next
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-400 shadow-theme-xs opacity-40 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800">
                Next
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
