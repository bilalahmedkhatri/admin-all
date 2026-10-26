"use client";
import { useTranslations } from "next-intl";

import { UserRound } from "@/components/gateway/icons";
import { PageTitle } from "@/components/gateway/shared";
import { Badge } from "@/components/gateway/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/gateway/ui/card";
import type { loader } from "@/lib/gateway/services/profile";

type PageData = Exclude<Awaited<ReturnType<typeof loader>>, Response>;
export default function Profile({ data: pageData }: { data: PageData }) {
  const gatewayCopy = useTranslations("gateway.copy");

  const user = pageData;
  return (
    <>
      <PageTitle
        title={gatewayCopy("m143")}
        description={gatewayCopy("m144")}
      ></PageTitle>
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/10">
              <UserRound className="size-6" />
            </span>
            <div className="min-w-0">
              <CardTitle className="break-words">{user.name}</CardTitle>
              <Badge variant="outline" className="mt-2 capitalize">
                {user.role}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="divide-y text-sm">
            {[
              ["Name", user.name],
              ["Email", user.email],
              ["Role", user.role],
              ["Account status", user.status],
            ].map(([label, value]) => (
              <div
                key={label}
                className="grid gap-2 py-4 sm:grid-cols-[140px_1fr]"
              >
                <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="break-words">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </>
  );
}
