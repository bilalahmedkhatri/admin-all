"use client";
import { useTranslations } from "next-intl";

import { Form, useFormResult } from "@/components/gateway/forms";
import { AuthPage } from "@/components/gateway/auth-page";
import { Field, Notice, Submit } from "@/components/gateway/shared";
import type { loader, action } from "@/lib/gateway/services/verify-email";

type PageData = Exclude<Awaited<ReturnType<typeof loader>>, Response>;
export default function VerifyEmail({}: { data: PageData }) {
  const gatewayCopy = useTranslations("gateway.copy");

  const data = useFormResult<typeof action>();
  return (
    <AuthPage title={gatewayCopy("m229")} description={gatewayCopy("m230")}>
      {data?.error && <Notice error>{data.error}</Notice>}
      <Form method="post" className="space-y-5">
        <Field
          name="code"
          label={gatewayCopy("m231")}
          inputMode="numeric"
          pattern="[0-9]{6}"
          minLength={6}
          maxLength={6}
          autoComplete="one-time-code"
          required
        />
        <Submit>{gatewayCopy("m232")}</Submit>
      </Form>
    </AuthPage>
  );
}
