"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/button/Button";
import BlogWebsiteCounts from "./BlogWebsiteCounts";
import { BlogCountsSkeleton, BlogTableSkeleton } from "./BlogPostsSkeleton";
import BlogPostsTable from "./BlogPostsTable";
import useBlogPosts from "./useBlogPosts";

export default function BlogPostsPage({
  isAdmin,
  canUpdate,
}: {
  isAdmin: boolean;
  canUpdate: boolean;
}) {
  const t = useTranslations("blog");
  const { apps, groups, filters, filter, loading, error, paginate, refresh } =
    useBlogPosts();
  const [search, setSearch] = useState("");
  const control =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100";
  return (
    <>
      <h1 className="sr-only">{t("blogs")}</h1>
      {loading ? <BlogCountsSkeleton /> : <BlogWebsiteCounts groups={groups} />}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          filter({ ...filters, search: search.trim() });
        }}
        className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4 dark:border-gray-800 dark:bg-gray-900"
      >
        <label className="space-y-2 text-sm">
          <span>{t("website")}</span>
          <select
            className={control}
            value={filters.website}
            onChange={(event) =>
              filter({ ...filters, website: event.target.value })
            }
          >
            <option value="">{t("allWebsites")}</option>
            {apps.map((app) => (
              <option key={app.key} value={app.key}>
                {app.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span>{t("status")}</span>
          <select
            className={control}
            value={filters.status}
            onChange={(event) =>
              filter({ ...filters, status: event.target.value })
            }
          >
            <option value="">{t("allStatuses")}</option>
            {["draft", "published", "archived"].map((status) => (
              <option key={status} value={status}>
                {t(status)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span>{t("searchTitle")}</span>
          <input
            type="search"
            maxLength={200}
            className={control}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <div className="flex items-end">
          <Button className="w-full" type="submit" disabled={loading}>
            {t("search")}
          </Button>
        </div>
      </form>
      {error && (
        <div
          role="alert"
          className="rounded-xl bg-error-50 p-4 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400"
        >
          {error}{" "}
          <button type="button" onClick={refresh} className="ms-2 underline">
            {t("retry")}
          </button>
        </div>
      )}
      <div aria-busy={loading} className="min-w-0 space-y-4">
        {loading ? (
          <>
            <p role="status" className="sr-only">
              {t("loadingPosts")}
            </p>
            <BlogTableSkeleton isAdmin={isAdmin} />
          </>
        ) : (
          <>
            {!apps.length && !error && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("noWebsites")}
              </p>
            )}
            {groups
              .filter((group) => group.error)
              .map((group) => (
                <p
                  key={group.app.key}
                  role="alert"
                  className="rounded-xl bg-error-50 p-4 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400"
                >
                  {group.app.label}: {group.error}{" "}
                  <button
                    type="button"
                    onClick={refresh}
                    className="ms-2 underline"
                  >
                    {t("retry")}
                  </button>
                </p>
              ))}
            <BlogPostsTable
              groups={groups.filter(
                (group) =>
                  !filters.website || group.app.key === filters.website,
              )}
              isAdmin={isAdmin}
              canUpdate={canUpdate}
              onPageChange={paginate}
            />
          </>
        )}
      </div>
    </>
  );
}
