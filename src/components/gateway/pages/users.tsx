"use client";
import { useTranslations } from "next-intl";

import { Form, useFormResult } from "@/components/gateway/forms";
import type { AdminUser } from "@/lib/gateway/types";
import {
  DataTable,
  Field,
  Notice,
  PageTitle,
  Submit,
} from "@/components/gateway/shared";
import { Badge } from "@/components/gateway/ui/badge";
import PermissionEditor from "@/components/gateway/PermissionEditor";
import AccessRequests from "@/components/gateway/AccessRequests";
import type { loader, action } from "@/lib/gateway/services/users";

type PageData = Exclude<Awaited<ReturnType<typeof loader>>, Response>;
export type TeamSection = "requests" | "members" | "invite";

export default function Team({
  data: pageData,
  section,
}: {
  data: PageData;
  section: TeamSection;
}) {
  const gatewayCopy = useTranslations("gateway.copy");

  const d = pageData;
  const data = useFormResult<typeof action>();
  function grants(user?: AdminUser) {
    return (
      <PermissionEditor
        key={JSON.stringify(user || "invite")}
        catalog={d}
        user={user}
      />
    );
  }
  const title = {
    requests: gatewayCopy("m213"),
    members: gatewayCopy("m217"),
    invite: gatewayCopy("m225"),
  }[section];

  return (
    <>
      <PageTitle title={title} description={gatewayCopy("m212")} />
      {data && (
        <Notice error={!data.success}>
          {data.error ||
            "Access updated. Changed memberships have their sessions revoked."}
        </Notice>
      )}
      {section === "requests" && <AccessRequests data={d} />}
      {section === "members" && (
        <DataTable
          rows={d.users}
          columns={[
            {
              title: "Member",
              render: (u) => (
                <div>
                  {u.name}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {u.email}
                  </p>
                </div>
              ),
            },
            {
              title: "Role",
              render: (u) => <Badge variant="outline">{u.role}</Badge>,
            },
            {
              title: "Status",
              render: (u) => <Badge variant="outline">{u.status}</Badge>,
            },
            {
              title: "Master key",
              render: (u) =>
                u.master_key ? (
                  <code
                    className="block max-w-xs text-xs break-all"
                    aria-label={`Master key for ${u.email}`}
                  >
                    {u.master_key}
                  </code>
                ) : u.role === "admin" ? (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {gatewayCopy("m218")}
                  </span>
                ) : u.status === "approved" ? (
                  <Form method="post">
                    <input name="intent" value="enable-api" type="hidden" />
                    <input name="id" value={u.id} type="hidden" />
                    <Submit variant="outline" size="sm">
                      {gatewayCopy("m219")}
                    </Submit>
                  </Form>
                ) : (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {gatewayCopy("m220")}
                  </span>
                ),
            },
            {
              title: "Access",
              render: (u) =>
                u.id === d.self ? (
                  <span className="text-xs">{gatewayCopy("m221")}</span>
                ) : (
                  <details
                    id={`member-${u.id}`}
                    open={location.hash === `#member-${u.id}` || undefined}
                    className="min-w-64 scroll-mt-4"
                  >
                    <summary className="cursor-pointer text-xs text-brand-500">
                      {gatewayCopy("m222")}
                    </summary>
                    <Form method="post" className="mt-4 space-y-4">
                      <input name="id" value={u.id} type="hidden" />
                      {grants(u)}
                      <Submit>{gatewayCopy("m223")}</Submit>
                    </Form>
                    <Form method="post" className="mt-4">
                      <input name="id" value={u.id} type="hidden" />
                      <input name="role" value={u.role} type="hidden" />
                      <input name="intent" value="revoke" type="hidden" />
                      <Submit variant="destructive">
                        {gatewayCopy("m224")}
                      </Submit>
                    </Form>
                  </details>
                ),
            },
          ]}
        />
      )}
      {section === "invite" && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <Form method="post" className="space-y-4">
            <input name="intent" value="invite" type="hidden" />
            <Field
              name="email"
              label={gatewayCopy("m226")}
              type="email"
              required
            />
            <Field name="name" label={gatewayCopy("m227")} maxLength={80} />
            {grants()}
            <Submit>{gatewayCopy("m228")}</Submit>
          </Form>
        </div>
      )}
    </>
  );
}
