"use client";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { blogEditPath } from "@/lib/gateway/blog-navigation";
import type { BlogPostGroup } from "./useBlogPosts";
import BlogPostActions from "./BlogPostActions";

export default function BlogPostsTable({
  groups,
  isAdmin,
  canUpdate,
  onPageChange,
}: {
  groups: BlogPostGroup[];
  isAdmin: boolean;
  canUpdate: boolean;
  onPageChange?: (app: string, page: number) => void;
}) {
  const t = useTranslations("blog");
  const locale = useLocale();
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const rows = groups.flatMap((group) =>
    group.items.map((post) => ({ app: group.app, post })),
  );
  const cell = "px-5 py-4 text-start text-sm";
  return (
    <div className="min-w-0 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="overflow-x-auto">
        <Table>
          <caption className="sr-only">{t("blogs")}</caption>
          <TableHeader className="border-b border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
            <TableRow>
              {[
                "title",
                "website",
                "status",
                ...(isAdmin ? ["createdBy"] : []),
                "publishedDate",
                "actions",
              ].map((key) => (
                <TableCell
                  key={key}
                  isHeader
                  className={`${cell} font-medium whitespace-nowrap`}
                >
                  {t(key)}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {!rows.length && (
              <TableRow>
                <td
                  colSpan={isAdmin ? 6 : 5}
                  className="px-5 py-12 text-sm text-gray-500 dark:text-gray-400"
                >
                  {t("noPosts")}
                </td>
              </TableRow>
            )}
            {rows.map(({ app, post }) => {
              const published = post.published_at
                ? new Date(post.published_at)
                : null;
              return (
                <TableRow key={`${app.key}:${post.id}`} className="align-top">
                  <TableCell className={`${cell} max-w-sm min-w-52`}>
                    <Link
                      href={blogEditPath(app.key, post.id)}
                      className="font-medium break-words text-gray-900 hover:text-brand-500 dark:text-white dark:hover:text-brand-400"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {post.locale}
                    </p>
                  </TableCell>
                  <TableCell className={`${cell} whitespace-nowrap`}>
                    {app.label}
                  </TableCell>
                  <TableCell className={cell}>
                    <Badge
                      size="sm"
                      color={
                        post.status === "published"
                          ? "success"
                          : post.status === "draft"
                            ? "warning"
                            : "light"
                      }
                    >
                      {t(post.status)}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className={`${cell} min-w-36`}>
                      {post.author_name || "—"}
                    </TableCell>
                  )}
                  <TableCell className={`${cell} whitespace-nowrap`}>
                    {published && !Number.isNaN(published.getTime()) ? (
                      <time dateTime={post.published_at ?? undefined}>
                        {date.format(published)}
                      </time>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className={cell}>
                    <BlogPostActions
                      app={app.key}
                      post={post}
                      canUpdate={canUpdate}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {onPageChange &&
        groups.some(
          (group) => !group.error && group.total > group.page_size,
        ) && (
          <div className="flex flex-wrap gap-4 border-t border-gray-200 p-4 dark:border-gray-800">
            {groups
              .filter((group) => !group.error && group.total > group.page_size)
              .map((group) => {
                const total = Math.ceil(group.total / group.page_size);
                return (
                  <label
                    key={group.app.key}
                    className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400"
                  >
                    <span>{group.app.label}</span>
                    <select
                      aria-label={t("pageForWebsite", {
                        website: group.app.label,
                      })}
                      value={group.page}
                      onChange={(event) =>
                        onPageChange(group.app.key, Number(event.target.value))
                      }
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    >
                      {Array.from({ length: total }, (_, index) => (
                        <option key={index + 1} value={index + 1}>
                          {t("page", { page: index + 1, total })}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              })}
          </div>
        )}
    </div>
  );
}
