"use client";
import { useTranslations } from "next-intl";

const pulse = "animate-pulse rounded bg-gray-200 dark:bg-gray-800";
export function BlogCountsSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl border border-gray-200 bg-white p-5 sm:grid-cols-3 xl:grid-cols-6 dark:border-gray-800 dark:bg-gray-900"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="space-y-3">
          <div className={`${pulse} h-4 w-20 max-w-full`} />
          <div className="flex items-center gap-2">
            <div className={`${pulse} h-8 w-8`} />
            <div className={`${pulse} h-1 w-2`} />
            <div className={`${pulse} h-8 w-8`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BlogTableSkeleton({ isAdmin = true }: { isAdmin?: boolean }) {
  const columns = isAdmin ? 6 : 5;
  return (
    <div
      aria-hidden="true"
      className="min-w-0 overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
    >
      <table className="w-full">
        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
          <tr>
            {Array.from({ length: columns }, (_, index) => (
              <th key={index} className="px-5 py-4">
                <div
                  className={`${pulse} h-4 ${index === 0 ? "w-44" : "w-20"}`}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {Array.from({ length: 5 }, (_, row) => (
            <tr key={row}>
              {Array.from({ length: columns }, (_, column) => (
                <td key={column} className="px-5 py-5">
                  <div
                    className={`${pulse} ${column === 0 ? "h-5 w-48" : column === columns - 1 ? "size-8" : "h-5 w-24"}`}
                  />
                  {column === 0 && <div className={`${pulse} mt-2 h-3 w-8`} />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BlogPostsSkeleton() {
  const t = useTranslations("blog");
  return (
    <div aria-busy="true" className="min-w-0 space-y-6">
      <p className="sr-only" role="status">
        {t("loadingPosts")}
      </p>
      <BlogCountsSkeleton />
      <div
        aria-hidden="true"
        className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4 dark:border-gray-800 dark:bg-gray-900"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="space-y-2">
            <div className={`${pulse} h-4 w-20`} />
            <div className={`${pulse} h-11 w-full`} />
          </div>
        ))}
      </div>
      <BlogTableSkeleton />
    </div>
  );
}
