"use client";
import { useTranslations } from "next-intl";
import type { BlogPostGroup } from "./useBlogPosts";

export default function BlogWebsiteCounts({
  groups,
}: {
  groups: BlogPostGroup[];
}) {
  const t = useTranslations("blog");
  if (!groups.length) return null;
  return (
    <section
      aria-label={t("websiteCounts")}
      className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
    >
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 xl:grid-cols-6">
        {groups.map((group) => (
          <div key={group.app.key} className="min-w-0">
            <dt className="text-sm text-gray-500 dark:text-gray-400">
              {group.app.label}
            </dt>
            <dd
              aria-label={
                group.counts
                  ? t("ownAndTotal", {
                      mine: group.counts.mine,
                      total: group.counts.total,
                    })
                  : t("postsError")
              }
              className="mt-1 flex items-center gap-2 text-2xl font-semibold"
            >
              <span className="text-success-600 dark:text-success-400">
                {group.error ? "—" : (group.counts?.mine ?? "—")}
              </span>
              <span aria-hidden="true" className="text-gray-400">
                -
              </span>
              <span className="text-black dark:text-white">
                {group.error ? "—" : (group.counts?.total ?? "—")}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
