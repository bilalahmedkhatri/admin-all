"use client";
import { useTranslations } from "next-intl";

import { Fragment } from "react";
import { Form } from "@/components/gateway/forms";
import {
  ChartNoAxesColumnIncreasing,
  KeyRound,
  Trash2,
} from "@/components/gateway/icons";
import { Submit } from "@/components/gateway/shared";
import { Button } from "@/components/gateway/ui/button";
import { Badge } from "@/components/gateway/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/gateway/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/gateway/ui/table";
import {
  keyDate,
  keyGroups,
  type KeyFilter,
  type KeyGrouping,
  type KeyMetadata,
} from "@/lib/gateway/api-keys";

export function ApiKeyTable({
  keys,
  filter,
  grouping,
}: {
  keys: KeyMetadata[];
  filter: KeyFilter;
  grouping: KeyGrouping;
}) {
  const gatewayCopy = useTranslations("gateway.copy");

  const groups = keyGroups(keys, filter, grouping);
  const count = groups.reduce((sum, group) => sum + group.keys.length, 0);
  return (
    <Table className="min-w-[640px]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {["Key", "Created", "Last used", "Status", ""].map((title, index) => (
            <TableHead key={index} className="h-14 px-0 text-sm font-normal">
              {title || <span className="sr-only">{gatewayCopy("m022")}</span>}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map((group) => (
          <Fragment key={group.label}>
            {group.label && (
              <TableRow className="bg-gray-50 dark:bg-white/5">
                <TableCell
                  colSpan={5}
                  className="py-3 text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {group.label} {gatewayCopy("m023")}
                  {group.keys.length}
                  {gatewayCopy("m024")}
                </TableCell>
              </TableRow>
            )}
            {group.keys.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="py-7 ps-0 pe-8">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="link"
                        className="font-mono h-auto p-0 text-sm"
                      >
                        {key.prefix}
                        {gatewayCopy("m025")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <div className="space-y-2 pe-6">
                        <DialogTitle className="text-lg font-semibold">
                          {key.name}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                          {gatewayCopy("m026")}
                        </DialogDescription>
                      </div>
                      <dl className="grid grid-cols-2 gap-4 text-sm">
                        <dt className="text-gray-500 dark:text-gray-400">
                          {gatewayCopy("m027")}
                        </dt>
                        <dd>
                          {gatewayCopy("m028")}
                          {key.id}
                        </dd>
                        <dt className="text-gray-500 dark:text-gray-400">
                          {gatewayCopy("m029")}
                        </dt>
                        <dd className="font-mono">
                          {key.prefix}
                          {gatewayCopy("m025")}
                        </dd>
                        <dt className="text-gray-500 dark:text-gray-400">
                          {gatewayCopy("m030")}
                        </dt>
                        <dd>{keyDate(key.created_at)}</dd>
                        <dt className="text-gray-500 dark:text-gray-400">
                          {gatewayCopy("m031")}
                        </dt>
                        <dd>{keyDate(key.last_used_at)}</dd>
                        <dt className="text-gray-500 dark:text-gray-400">
                          {gatewayCopy("m032")}
                        </dt>
                        <dd>{key.is_active ? "Active" : "Revoked"}</dd>
                      </dl>
                    </DialogContent>
                  </Dialog>
                  <p
                    className="mt-1 max-w-64 truncate text-sm text-gray-500 dark:text-gray-400"
                    title={key.name}
                  >
                    {key.name}
                  </p>
                </TableCell>
                <TableCell className="px-0 pe-8 whitespace-nowrap">
                  {keyDate(key.created_at)}
                </TableCell>
                <TableCell className="px-0 pe-8 whitespace-nowrap text-gray-500 dark:text-gray-400">
                  {keyDate(key.last_used_at)}
                </TableCell>
                <TableCell className="px-0 pe-8">
                  <Badge
                    variant="outline"
                    className={
                      key.is_active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  >
                    {key.is_active ? "Active" : "Revoked"}
                  </Badge>
                </TableCell>
                <TableCell className="ps-0 text-end">
                  <div className="inline-flex items-center gap-3">
                    <span
                      role="img"
                      aria-label={`Statistics for ${key.name}`}
                      title={gatewayCopy("m033")}
                      className="inline-flex size-9 items-center justify-center text-gray-500 dark:text-gray-400"
                    >
                      <ChartNoAxesColumnIncreasing
                        className="size-5"
                        aria-hidden="true"
                      />
                    </span>
                    {key.is_active && (
                      <Form
                        method="post"
                        onSubmit={(event) => {
                          if (
                            !confirm(
                              `Revoke ${key.name}? Requests using this key will fail immediately.`,
                            )
                          )
                            event.preventDefault();
                        }}
                      >
                        <input type="hidden" name="intent" value="revoke" />
                        <input type="hidden" name="id" value={key.id} />
                        <Submit
                          variant="ghost"
                          size="icon"
                          aria-label={`Revoke ${key.name}`}
                          title={gatewayCopy("m034")}
                        >
                          <Trash2 className="size-4" />
                        </Submit>
                      </Form>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Fragment>
        ))}
        {!count && (
          <TableRow>
            <TableCell colSpan={5} className="py-20 text-center">
              <KeyRound className="mx-auto mb-4 size-6 text-gray-500 dark:text-gray-400" />
              <p className="font-medium">
                {keys.length ? "No keys match this filter" : "No API keys yet"}
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {keys.length
                  ? "Choose another filter to see your keys."
                  : "Create an API key to connect your application."}
              </p>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
