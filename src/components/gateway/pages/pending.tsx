"use client";
import { useTranslations } from "next-intl";

import { AuthPage } from "@/components/gateway/auth-page";
import { Notice } from "@/components/gateway/shared";

type PageData = null;
export default function Pending({}: { data: PageData }) {
  const gatewayCopy = useTranslations("gateway.copy");

  return (
    <AuthPage title={gatewayCopy("m140")} description={gatewayCopy("m141")}>
      <Notice>{gatewayCopy("m142")}</Notice>
    </AuthPage>
  );
}
