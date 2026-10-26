"use client";
import { useTranslations } from "next-intl";
import { Loading } from "@/components/gateway/loading";

export default function PageLoading() {
  const t = useTranslations("gateway");
  return (
    <div
      aria-busy="true"
      className="absolute inset-0 flex items-center justify-center p-8"
    >
      <Loading kind="page" label={t("loadingPage")} />
    </div>
  );
}
