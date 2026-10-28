"use client";
import { useTranslations } from "next-intl";
import { FaEllipsisH, FaPencilAlt } from "react-icons/fa";
import { Link } from "@/i18n/navigation";
import type { BlogPost } from "@/lib/gateway/blog-client";
import { blogEditPath, publishedBlogUrl } from "@/lib/gateway/blog-navigation";

export default function BlogPostActions({
  app,
  post,
  canUpdate,
}: {
  app: string;
  post: BlogPost;
  canUpdate: boolean;
}) {
  const t = useTranslations("blog");
  const publicUrl = publishedBlogUrl(post);
  const itemClass =
    "block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus-visible:outline-brand-500 dark:text-gray-200 dark:hover:bg-gray-800";
  return (
    <div className="flex items-start gap-1">
      <Link
        href={blogEditPath(app, post.id)}
        aria-label={t(canUpdate ? "editPost" : "openPost")}
        title={t(canUpdate ? "editPost" : "openPost")}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-brand-500 focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-400"
      >
        <FaPencilAlt aria-hidden />
      </Link>
      {publicUrl && (
        <details className="group min-w-10">
          <summary
            aria-label={t("actionsFor", { title: post.title })}
            className="flex w-fit cursor-pointer list-none items-center justify-center rounded-lg p-3 text-gray-500 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-gray-400 dark:hover:bg-gray-800 [&::-webkit-details-marker]:hidden"
          >
            <FaEllipsisH aria-hidden />
          </summary>
          <div className="mt-2 min-w-40 space-y-1 rounded-lg bg-gray-50 p-1 dark:bg-gray-950">
            {publicUrl && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={itemClass}
              >
                {t("viewPublished")}
              </a>
            )}
          </div>
        </details>
      )}
    </div>
  );
}
