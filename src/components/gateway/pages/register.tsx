"use client";
import { useTranslations } from "next-intl";

import { Form, useFormResult } from "@/components/gateway/forms";
import { AuthPage } from "@/components/gateway/auth-page";
import { Field, Notice, Submit } from "@/components/gateway/shared";
import type { action } from "@/lib/gateway/services/register";

type PageData = null;
export default function RequestAccess({}: { data: PageData }) {
  const gatewayCopy = useTranslations("gateway.copy");

  const data = useFormResult<typeof action>();
  return (
    <AuthPage
      register
      title={gatewayCopy("m145")}
      description={gatewayCopy("m146")}
    >
      {data?.error && <Notice error>{data.error}</Notice>}
      <Form method="post" className="space-y-5">
        <Field
          name="name"
          label={gatewayCopy("m147")}
          required
          minLength={2}
          maxLength={80}
        />
        <Field
          name="email"
          label={gatewayCopy("m148")}
          type="email"
          required
          maxLength={254}
        />
        <Field
          name="reason"
          label={gatewayCopy("m149")}
          multiline
          required
          minLength={10}
          maxLength={1000}
        />
        <Submit>{gatewayCopy("m150")}</Submit>
      </Form>
    </AuthPage>
  );
}
