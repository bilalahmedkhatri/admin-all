"use client";
import { useTranslations } from "next-intl";

export default function BlogPageLoading() {
  const t = useTranslations("blog");
  return (
    <div aria-busy="true" className="space-y-6">
      <p className="sr-only" role="status">
        {t("loading")}
      </p>
      <div
        aria-hidden="true"
        className="grid animate-pulse gap-6 xl:grid-cols-3"
      >
        <div className="space-y-6 xl:col-span-2">
          <div className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          <div className="h-96 rounded-2xl bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="space-y-6">
          <div className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          <div className="h-48 rounded-2xl bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  );
}
