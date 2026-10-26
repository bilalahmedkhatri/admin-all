"use client";
import { useTranslations } from "next-intl";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { Form, useFormNavigation } from "@/components/gateway/forms";
import { Loading } from "@/components/gateway/loading";
import { Button, type ButtonProps } from "@/components/gateway/ui/button";
import { Badge } from "@/components/gateway/ui/badge";
import { Input } from "@/components/gateway/ui/input";
import { Label } from "@/components/gateway/ui/label";
import { Textarea } from "@/components/gateway/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/gateway/ui/table";
import { Card, CardContent } from "@/components/gateway/ui/card";
import { cn } from "@/lib/gateway/utils";

export function PageTitle({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <PageBreadCrumb pageTitle={title} />
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}
export function Notice({
  children,
  error = false,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={cn(
        "mb-5 rounded-lg border p-4 text-sm",
        error
          ? "border-error-200 bg-error-50 text-error-700 dark:border-error-800 dark:bg-error-500/10 dark:text-error-400"
          : "border-success-200 bg-success-50 text-success-700 dark:border-success-800 dark:bg-success-500/10 dark:text-success-400",
      )}
    >
      {children}
    </div>
  );
}
export function Field({
  name,
  label,
  description,
  multiline,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  description?: string;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {multiline ? (
        <Textarea
          id={name}
          name={name}
          defaultValue={props.defaultValue as string}
          required={props.required}
          minLength={props.minLength}
          maxLength={props.maxLength}
          placeholder={props.placeholder}
          rows={8}
          className="font-mono text-xs"
        />
      ) : (
        <Input id={name} name={name} {...props} />
      )}
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
}
export function Submit({
  children,
  disabled,
  variant,
  className,
  ...props
}: Omit<ButtonProps, "asChild">) {
  const gatewayCopy = useTranslations("gateway.copy");

  const navigation = useFormNavigation();
  const busy =
    navigation.state !== "idle" && navigation.formMethod !== undefined;
  return (
    <Button
      {...props}
      type="submit"
      variant={variant}
      className={className}
      disabled={busy || disabled}
    >
      {busy && <Loading kind="button" label={gatewayCopy("m265")} />}
      {children}
    </Button>
  );
}
export function Method({ method }: { method: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono min-w-14 justify-center text-theme-xs",
        method === "GET"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : method === "DELETE"
            ? "border-red-200 bg-red-50 text-red-700"
            : method === "POST"
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-amber-200 bg-amber-50 text-amber-800",
      )}
    >
      {method}
    </Badge>
  );
}
export function DataTable<T>({
  rows,
  columns,
  empty = "No records yet.",
}: {
  rows: T[];
  columns: { title: string; render: (row: T) => React.ReactNode }[];
  empty?: string;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.title} className="px-5">
                  {c.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((c) => (
                    <TableCell key={c.title} className="px-5 py-4">
                      {c.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="p-10 text-center text-gray-500 dark:text-gray-400"
                >
                  {empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
export function LogoutButton() {
  const gatewayCopy = useTranslations("gateway.copy");

  return (
    <Form method="post" action="/logout">
      <Submit variant="ghost" size="sm">
        {gatewayCopy("m266")}
      </Submit>
    </Form>
  );
}
