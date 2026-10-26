"use client";
import { useTranslations } from "next-intl";

import { AuthPage } from "@/components/gateway/auth-page";
import { Notice, LogoutButton } from "@/components/gateway/shared";
import type { loader } from "@/lib/gateway/services/access";

type PageData = Exclude<Awaited<ReturnType<typeof loader>>, Response>;
export default function Access({}: { data: PageData }) {
  const gatewayCopy = useTranslations("gateway.copy");

  return (
    <AuthPage title={gatewayCopy("m084")} description={gatewayCopy("m085")}>
      <Notice>{gatewayCopy("m086")}</Notice>
      <LogoutButton />
    </AuthPage>
  );
}
