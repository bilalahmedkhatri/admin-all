"use client";
import { useTranslations } from "next-intl";

import { AuthPage } from "@/components/gateway/auth-page";
import { GoogleSignIn } from "@/components/gateway/google-sign-in";
import { Notice } from "@/components/gateway/shared";
import type { loader } from "@/lib/gateway/services/login";

type PageData = Exclude<Awaited<ReturnType<typeof loader>>, Response>;
export default function Login({ data: pageData }: { data: PageData }) {
  const gatewayCopy = useTranslations("gateway.copy");

  const { oauth } = pageData;
  return (
    <AuthPage title={gatewayCopy("m128")} description={gatewayCopy("m129")}>
      {oauth && (
        <Notice error>
          {oauth === "denied"
            ? "Your workspace access has not been approved. Contact an administrator or request access."
            : oauth === "unconfigured"
              ? "Backend sign-in is unavailable. Contact your administrator."
              : "Sign-in could not be completed. Please try again."}
        </Notice>
      )}
      <GoogleSignIn />
      <p className="mt-5 text-center text-xs text-gray-500 dark:text-gray-400">
        {gatewayCopy("m130")}
      </p>
    </AuthPage>
  );
}
