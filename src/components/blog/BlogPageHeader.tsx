import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { FaChevronRight } from "react-icons/fa";

export default function BlogPageHeader({
  title,
  description,
  breadcrumb,
  context,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumb?: { label: string; href: string };
  context?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex min-w-0 flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs sm:p-5 lg:flex-row lg:items-center lg:justify-between dark:border-gray-800 dark:bg-gray-900">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {breadcrumb && (
            <>
              <Link
                href={breadcrumb.href}
                className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
              >
                {breadcrumb.label}
              </Link>
              <FaChevronRight
                aria-hidden
                className="shrink-0 text-theme-xs text-gray-400 rtl:rotate-180"
              />
            </>
          )}
          <h1 className="text-lg font-semibold break-words text-gray-900 dark:text-white">
            {title}
          </h1>
          {context && (
            <span className="rounded-full bg-brand-50 px-2 py-1 text-xs text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              {context}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 [&>a]:flex-1 sm:[&>a]:flex-none [&>button]:flex-1 sm:[&>button]:flex-none">
          {actions}
        </div>
      )}
    </header>
  );
}
