"use client";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/button/Button";

export default function BlogPageError({ retry }: { retry: () => void }) {
  const t = useTranslations("blog");
  return (
    <section
      role="alert"
      className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 dark:border-gray-800 dark:bg-gray-900"
    >
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
        {t("loadError")}
      </h1>
      <p className="my-4 text-sm text-gray-500 dark:text-gray-400">
        {t("loadErrorHint")}
      </p>
      <Button onClick={retry}>{t("retry")}</Button>
    </section>
  );
}
