"use client";
import { useTranslations } from "next-intl";

import { Form, useFormResult } from "@/components/gateway/forms";
import { KeyRound, Trash2 } from "@/components/gateway/icons";
import { Badge } from "@/components/gateway/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/gateway/ui/card";
import { Label } from "@/components/gateway/ui/label";
import {
  DataTable,
  Field,
  Notice,
  PageTitle,
  Submit,
} from "@/components/gateway/shared";
import type { loader, action } from "@/lib/gateway/services/settings";

type PageData = Exclude<Awaited<ReturnType<typeof loader>>, Response>;
export default function Settings({ data: pageData }: { data: PageData }) {
  const gatewayCopy = useTranslations("gateway.copy");

  const d = pageData;
  const result = useFormResult<typeof action>();
  return (
    <>
      <PageTitle
        title={gatewayCopy("m183")}
        description={gatewayCopy("m184")}
      />
      {result && (
        <Notice error={!result.success}>
          {result.error || "Credential settings updated."}
        </Notice>
      )}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {Object.entries(d.configured).map(([name, ready]) => (
          <Card key={name}>
            <CardContent className="flex items-center justify-between p-5">
              <span className="text-sm capitalize">
                {name === "vault"
                  ? "Encryption vault"
                  : `${name} environment key`}
              </span>
              <Badge variant="outline">
                {ready ? "Configured" : "Not configured"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mb-6 grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{gatewayCopy("m185")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form method="post" className="space-y-5">
              <Field
                label={gatewayCopy("m186")}
                name="label"
                required
                maxLength={80}
                placeholder={gatewayCopy("m187")}
                description={gatewayCopy("m188")}
              />
              <div className="space-y-2">
                <Label htmlFor="kind">{gatewayCopy("m189")}</Label>
                <select
                  id="kind"
                  name="kind"
                  className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white px-3 text-sm dark:bg-gray-900"
                >
                  <option value="app">{gatewayCopy("m190")}</option>
                  <option value="admin">{gatewayCopy("m191")}</option>
                </select>
              </div>
              <Field
                label={gatewayCopy("m192")}
                name="secret"
                type="password"
                autoComplete="off"
                required
                minLength={10}
              />
              <Field
                label={gatewayCopy("m193")}
                name="origin"
                defaultValue={d.origin}
                description={gatewayCopy("m194")}
              />
              <Submit disabled={!d.configured.vault}>
                <KeyRound className="me-2 size-4" />
                {gatewayCopy("m195")}
              </Submit>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{gatewayCopy("m196")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-white/5">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {gatewayCopy("m197")}
              </p>
              <code className="mt-2 block text-sm break-all">{d.url}</code>
            </div>
            <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
              {gatewayCopy("m198")}
            </p>
            <Notice>{gatewayCopy("m199")}</Notice>
            {!d.configured.vault && (
              <Notice error>{gatewayCopy("m200")}</Notice>
            )}
            <p className="text-xs leading-6 text-gray-500 dark:text-gray-400">
              {gatewayCopy("m201")}
            </p>
          </CardContent>
        </Card>
      </div>
      <DataTable
        rows={d.credentials}
        columns={[
          {
            title: "Label",
            render: (c) => <span className="font-medium">{c.label}</span>,
          },
          {
            title: "Type",
            render: (c) => <Badge variant="outline">{c.kind}</Badge>,
          },
          {
            title: "Origin",
            render: (c) => (
              <code className="text-xs">{c.app_origin || "No value"}</code>
            ),
          },
          {
            title: "Secret",
            render: () => (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {gatewayCopy("m202")}
              </span>
            ),
          },
          {
            title: "Remove",
            render: (c) => (
              <Form
                method="post"
                onSubmit={(event) => {
                  if (
                    !confirm(
                      "Remove this saved credential from the dashboard vault?",
                    )
                  )
                    event.preventDefault();
                }}
              >
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="id" value={c.id} />
                <Submit
                  type="submit"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${c.label}`}
                >
                  <Trash2 className="size-4 text-error-500" />
                </Submit>
              </Form>
            ),
          },
        ]}
      />
    </>
  );
}
