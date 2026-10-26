"use client";
import { useTranslations } from "next-intl";

import { useState } from "react";
import { Link } from "@/components/gateway/forms";
import { FileText } from "@/components/gateway/icons";
import { Button } from "@/components/gateway/ui/button";
import { Badge } from "@/components/gateway/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/gateway/ui/dialog";
import { DataTable, Notice } from "@/components/gateway/shared";
import { ApiKeyCreateDialog } from "@/components/gateway/api-key-create-dialog";
import { ApiKeyTable } from "@/components/gateway/api-key-table";
import type {
  KeyFilter,
  KeyGrouping,
  KeyMetadata,
} from "@/lib/gateway/api-keys";
import type { PendingAccess } from "@/lib/gateway/pending-access";

export function ApiKeysView({
  keys,
  enabled,
  unlocked,
  pending,
  error,
}: {
  keys: KeyMetadata[];
  enabled: boolean;
  unlocked: boolean;
  pending?: PendingAccess[];
  error?: string | null;
}) {
  const gatewayCopy = useTranslations("gateway.copy");

  const [filter, setFilter] = useState<KeyFilter>("all");
  const [grouping, setGrouping] = useState<KeyGrouping>("key");
  return (
    <div className="space-y-10 pb-8">
      <header className="flex flex-wrap items-center justify-between gap-5">
        <h1 className="text-3xl font-semibold tracking-tight">
          {gatewayCopy("m035")}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="h-11 rounded-full px-4">
                <FileText className="size-4" />
                {gatewayCopy("m036")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <div className="space-y-2 pe-6">
                <DialogTitle className="text-xl font-semibold">
                  {gatewayCopy("m036")}
                </DialogTitle>
                <DialogDescription className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                  {gatewayCopy("m037")}
                </DialogDescription>
              </div>
              <pre className="overflow-x-auto rounded-lg bg-gray-50 p-4 text-xs leading-6 dark:bg-white/5">
                <code>
                  {
                    "GET /api/v1/audio/models\nAuthorization: Bearer <your-api-key>"
                  }
                </code>
              </pre>
              <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                {gatewayCopy("m038")}
              </p>
            </DialogContent>
          </Dialog>
          <ApiKeyCreateDialog
            enabled={enabled}
            unlocked={unlocked}
            onCreated={() => setFilter("all")}
          />
        </div>
      </header>
      {error && <Notice error>{error}</Notice>}
      <div className="flex flex-wrap items-center justify-between gap-5 pt-2">
        <div
          className="flex items-center gap-3"
          role="group"
          aria-label={gatewayCopy("m039")}
        >
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {gatewayCopy("m040")}
          </span>
          {(["key", "status"] as const).map((value) => (
            <Button
              key={value}
              variant={grouping === value ? "secondary" : "ghost"}
              aria-pressed={grouping === value}
              className="rounded-full px-5"
              onClick={() => setGrouping(value)}
            >
              {grouping === value && (
                <span
                  aria-hidden
                  className="bg-foreground size-1.5 rounded-full"
                />
              )}
              {value === "key" ? "API key" : "Status"}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <label
            htmlFor="key-filter"
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {gatewayCopy("m041")}
          </label>
          <select
            id="key-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value as KeyFilter)}
            className="focus:ring-ring h-11 min-w-44 rounded-full border border-gray-200 bg-gray-50 px-5 text-sm focus:ring-2 focus:outline-none dark:border-gray-800 dark:bg-white/5"
          >
            <option value="all">{gatewayCopy("m042")}</option>
            <option value="active">{gatewayCopy("m043")}</option>
            <option value="revoked">{gatewayCopy("m044")}</option>
          </select>
        </div>
      </div>
      <ApiKeyTable keys={keys} filter={filter} grouping={grouping} />
      {pending !== undefined && (
        <details className="border-t pt-6">
          <summary className="cursor-pointer text-sm font-medium">
            {gatewayCopy("m045")}{" "}
            <Badge variant="secondary" className="ms-2">
              {pending.length}
            </Badge>
          </summary>
          <div className="mt-5">
            <DataTable
              rows={pending}
              empty={gatewayCopy("m046")}
              columns={[
                {
                  title: "Member",
                  render: (row) => (
                    <div>
                      {row.name}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {row.email}
                      </p>
                    </div>
                  ),
                },
                {
                  title: "Status",
                  render: (row) => (
                    <span className="text-gray-500 dark:text-gray-400">
                      {row.verification}
                    </span>
                  ),
                },
                {
                  title: "Action",
                  render: (row) => (
                    <Button asChild variant="outline" size="sm">
                      <Link to={row.reviewPath}>{gatewayCopy("m047")}</Link>
                    </Button>
                  ),
                },
              ]}
            />
          </div>
        </details>
      )}
    </div>
  );
}
