"use client";

import { useTranslations } from "next-intl";
import { Form, useFeatureLocation } from "@/components/gateway/forms";
import { Submit } from "@/components/gateway/shared";
import { Badge } from "@/components/gateway/ui/badge";
import PermissionEditor from "@/components/gateway/PermissionEditor";
import type { loader } from "@/lib/gateway/services/users";

type PageData = Exclude<Awaited<ReturnType<typeof loader>>, Response>;

export default function AccessRequests({ data }: { data: PageData }) {
  const copy = useTranslations("gateway.copy");
  const t = useTranslations("gateway.permissionEditor");
  const location = useFeatureLocation();
  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
      {!data.requests.length && (
        <p className="p-6 text-sm text-gray-500 dark:text-gray-400">
          {t("emptyRequests")}
        </p>
      )}
      {data.requests.map((request) => {
        const existing = data.users.find(
          (user) => user.email.toLowerCase() === request.email.toLowerCase(),
        );
        const summary = (
          <div className="grid items-start gap-4 md:grid-cols-12">
            <div className="min-w-0 md:col-span-3">
              <p className="font-medium">{request.name}</p>
              <p className="text-xs break-all text-gray-500 dark:text-gray-400">
                {request.email}
              </p>
            </div>
            <p className="text-sm break-words whitespace-pre-wrap text-gray-500 md:col-span-4 dark:text-gray-400">
              {request.reason}
            </p>
            <div className="flex flex-wrap gap-2 md:col-span-3">
              <Badge variant="outline">
                {request.email_verified ? t("verified") : t("unverified")}
              </Badge>
              <Badge variant="outline">{request.status}</Badge>
            </div>
            {request.status === "pending" && (
              <span className="text-sm font-medium text-brand-500 md:col-span-2">
                {copy("m047")}
              </span>
            )}
          </div>
        );
        if (request.status !== "pending")
          return (
            <article key={request.id} className="p-5">
              {summary}
            </article>
          );
        return (
          <details
            key={request.id}
            id={`request-${request.id}`}
            open={location.hash === `#request-${request.id}` || undefined}
            className="scroll-mt-4"
          >
            <summary className="cursor-pointer list-none p-5 focus-visible:outline-2 focus-visible:outline-brand-500">
              {summary}
            </summary>
            <div className="space-y-4 border-t border-gray-200 p-5 dark:border-gray-800">
              {request.email_verified ? (
                <Form method="post" className="space-y-5">
                  <input
                    name="intent"
                    value={existing ? "update" : "invite"}
                    type="hidden"
                  />
                  {existing && (
                    <input name="id" value={existing.id} type="hidden" />
                  )}
                  <input name="email" value={request.email} type="hidden" />
                  <input name="name" value={request.name} type="hidden" />
                  <PermissionEditor
                    key={JSON.stringify(existing || request.id)}
                    catalog={data}
                    user={
                      existing ? { ...existing, status: "approved" } : undefined
                    }
                  />
                  <Submit>{copy("m214")}</Submit>
                </Form>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {copy("m215")}
                </p>
              )}
              <Form method="post">
                <input name="intent" value="reject" type="hidden" />
                <input name="id" value={request.id} type="hidden" />
                <Submit variant="outline">{copy("m216")}</Submit>
              </Form>
            </div>
          </details>
        );
      })}
    </div>
  );
}
