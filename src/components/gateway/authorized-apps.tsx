"use client";
import { useTranslations } from "next-intl";

import { useEffect, useRef, useState } from "react";
import { Form, useFeatureForm } from "@/components/gateway/forms";
import { ChartNoAxesColumnIncreasing, Plus } from "@/components/gateway/icons";
import { Button } from "@/components/gateway/ui/button";
import { Input } from "@/components/gateway/ui/input";
import { Label } from "@/components/gateway/ui/label";
import { Badge } from "@/components/gateway/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/gateway/ui/dialog";
import { DataTable, Field, Notice } from "@/components/gateway/shared";
import { Loading } from "@/components/gateway/loading";
import type {
  AppsCatalog,
  AuthorizedApp,
  GatewayOwner,
} from "@/lib/gateway/authorized-apps";
import type { action } from "@/lib/gateway/services/apps";

export function AuthorizedAppsView({ apps, owners, endpoints }: AppsCatalog) {
  const gatewayCopy = useTranslations("gateway.copy");

  const [editor, setEditor] = useState<AuthorizedApp | "create" | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const trigger = useRef<HTMLButtonElement | null>(null);
  const owner = (id: number) => owners.find((value) => value.id === id);
  const rows = apps.filter((app) =>
    `${app.name} ${app.id} ${app.allowed_origin} ${owner(app.owner_user_id)?.email || ""}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  return (
    <div className="space-y-8 pb-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          {gatewayCopy("m048")}
        </h1>
        <Button
          className="h-11 rounded-lg px-5"
          onClick={(event) => {
            trigger.current = event.currentTarget;
            setEditor("create");
          }}
        >
          <Plus className="size-4" />
          {gatewayCopy("m049")}
        </Button>
      </header>
      <p className="max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
        {gatewayCopy("m050")}
      </p>
      {message && <Notice>{message}</Notice>}
      <Input
        aria-label={gatewayCopy("m051")}
        placeholder={gatewayCopy("m052")}
        className="h-11 max-w-sm rounded-full px-5"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <DataTable
        rows={rows}
        empty={gatewayCopy("m053")}
        columns={[
          {
            title: "App",
            render: (app) => (
              <div className="min-w-36 font-medium">
                {app.name}
                <p className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  {gatewayCopy("m054")}
                  {app.id}
                </p>
              </div>
            ),
          },
          {
            title: "Gateway owner",
            render: (app) => (
              <div className="min-w-48 text-sm break-all">
                {owner(app.owner_user_id)?.email ||
                  `Owner #${app.owner_user_id}`}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {gatewayCopy("m055")}
                  {app.owner_user_id} {gatewayCopy("m056")}{" "}
                  {owner(app.owner_user_id)?.is_active &&
                  owner(app.owner_user_id)?.api_access_enabled
                    ? "enabled"
                    : "disabled"}
                </p>
              </div>
            ),
          },
          {
            title: "Origin",
            render: (app) => (
              <span className="inline-block min-w-40 text-xs break-all">
                {app.allowed_origin || "Customer API project"}
              </span>
            ),
          },
          {
            title: "Status",
            render: (app) => (
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {app.is_active ? "Active" : "Disabled"}
                </Badge>
                <Badge variant="secondary">
                  {app.is_approved ? "Approved" : "Pending"}
                </Badge>
              </div>
            ),
          },
          {
            title: "Permissions",
            render: (app) => `${app.allowed_endpoints.length} endpoints`,
          },
          {
            title: "Action",
            render: (app) => (
              <div className="flex items-center gap-3">
                <span
                  role="img"
                  aria-label={`Statistics for ${app.name}`}
                  title={gatewayCopy("m057")}
                  className="inline-flex size-9 shrink-0 items-center justify-center text-gray-500 dark:text-gray-400"
                >
                  <ChartNoAxesColumnIncreasing
                    className="size-5"
                    aria-hidden="true"
                  />
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(event) => {
                    trigger.current = event.currentTarget;
                    setEditor(app);
                  }}
                >
                  {gatewayCopy("m058")}
                </Button>
              </div>
            ),
          },
        ]}
      />
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {rows.length} {gatewayCopy("m059")}
        {apps.length} {gatewayCopy("m060")}
      </p>
      <details className="border-t pt-5">
        <summary className="cursor-pointer text-sm font-medium">
          {gatewayCopy("m061")}
        </summary>
        <p className="my-4 text-sm text-gray-500 dark:text-gray-400">
          {gatewayCopy("m062")}
        </p>
        <DataTable
          rows={owners}
          columns={[
            {
              title: "Gateway owner",
              render: (value) => (
                <span>
                  {value.email}
                  <span className="ms-2 text-xs text-gray-500 dark:text-gray-400">
                    {gatewayCopy("m028")}
                    {value.id}
                  </span>
                </span>
              ),
            },
            {
              title: "Account",
              render: (value) => (value.is_active ? "Active" : "Inactive"),
            },
            {
              title: "API access",
              render: (value) =>
                value.api_access_enabled ? "Enabled" : "Disabled",
            },
            {
              title: "Action",
              render: (value) => <OwnerAccess owner={value} />,
            },
          ]}
        />
      </details>
      <Dialog
        open={editor !== null}
        onOpenChange={(open) => {
          if (!open) setEditor(null);
        }}
      >
        {editor !== null && (
          <AppEditor
            key={typeof editor === "string" ? editor : editor.id}
            app={editor === "create" ? null : editor}
            owners={owners}
            endpoints={endpoints}
            restoreFocus={() => trigger.current?.focus()}
            onSaved={() => {
              setEditor(null);
              setMessage("App settings saved.");
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

function AppEditor({
  app,
  owners,
  endpoints,
  onSaved,
  restoreFocus,
}: {
  app: AuthorizedApp | null;
  owners: GatewayOwner[];
  endpoints: string[];
  onSaved: () => void;
  restoreFocus: () => void;
}) {
  const gatewayCopy = useTranslations("gateway.copy");

  const fetcher = useFeatureForm<typeof action>();
  const busy = fetcher.state !== "idle";
  const submitting = useRef(false);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(
    new Set(app?.allowed_endpoints || []),
  );
  const options = [...new Set([...endpoints, ...selected])].sort();
  useEffect(() => {
    if (fetcher.state === "idle") {
      submitting.current = false;
      if (fetcher.data?.success) onSaved();
    }
  }, [fetcher.state, fetcher.data, onSaved]);
  return (
    <DialogContent
      className="max-w-2xl"
      closeDisabled={busy}
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        restoreFocus();
      }}
      onEscapeKeyDown={(event) => {
        if (busy || submitting.current) event.preventDefault();
      }}
      onInteractOutside={(event) => {
        if (busy || submitting.current) event.preventDefault();
      }}
    >
      <div className="space-y-2 pe-6">
        <DialogTitle className="text-xl font-semibold">
          {app ? `Manage ${app.name}` : "Add authorized app"}
        </DialogTitle>
        <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
          {gatewayCopy("m063")}
        </DialogDescription>
      </div>
      {!busy && fetcher.data?.error && (
        <Notice error>{fetcher.data.error}</Notice>
      )}
      <Form
        method="post"
        submit={fetcher.submit}
        pending={fetcher.state !== "idle"}
        aria-busy={busy}
        onSubmit={(event) => {
          if (busy || submitting.current) event.preventDefault();
          else submitting.current = true;
        }}
      >
        <input type="hidden" name="intent" value={app ? "update" : "create"} />
        {app && <input type="hidden" name="id" value={app.id} />}
        <fieldset className="min-w-0 space-y-5" disabled={busy}>
          {app ? (
            <p className="text-sm break-all">
              {gatewayCopy("m064")}
              {app.owner_user_id} {gatewayCopy("m065")}{" "}
              {owners.find((owner) => owner.id === app.owner_user_id)?.email}
              <br />
              {gatewayCopy("m066")}
              {app.allowed_origin || "Customer API project"}
            </p>
          ) : (
            <>
              <Field
                name="name"
                label={gatewayCopy("m067")}
                required
                minLength={2}
                maxLength={128}
              />
              <div className="space-y-2">
                <Label htmlFor="app-owner">{gatewayCopy("m068")}</Label>
                <select
                  id="app-owner"
                  name="owner_user_id"
                  required
                  defaultValue=""
                  className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white px-3 text-sm dark:bg-gray-900"
                >
                  <option value="" disabled>
                    {gatewayCopy("m069")}
                  </option>
                  {owners
                    .filter((owner) => owner.is_active)
                    .map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.email} {gatewayCopy("m070")}
                        {owner.id}
                        {gatewayCopy("m024")}
                      </option>
                    ))}
                </select>
              </div>
              <Field
                name="allowed_origin"
                label={gatewayCopy("m071")}
                placeholder={gatewayCopy("m072")}
                type="url"
                required
                maxLength={512}
                description={gatewayCopy("m073")}
              />
            </>
          )}
          <div className="flex gap-6 text-sm">
            {app && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={app.is_active}
                />
                {gatewayCopy("m074")}
              </label>
            )}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_approved"
                defaultChecked={app?.is_approved || false}
              />
              {gatewayCopy("m075")}
            </label>
          </div>
          <div className="space-y-3">
            <Label htmlFor="endpoint-search">
              {gatewayCopy("m076")}
              {selected.size} {gatewayCopy("m077")}
            </Label>
            <Input
              id="endpoint-search"
              placeholder={gatewayCopy("m078")}
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
            {[...selected].map((endpoint) => (
              <input
                key={endpoint}
                type="hidden"
                name="allowed_endpoints"
                value={endpoint}
              />
            ))}
            <div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border border-gray-300 dark:border-gray-700 p-3">
              {options
                .filter((endpoint) =>
                  endpoint.toLowerCase().includes(filter.trim().toLowerCase()),
                )
                .map((endpoint) => (
                  <label
                    key={endpoint}
                    className="flex items-start gap-3 text-xs leading-5"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={selected.has(endpoint)}
                      onChange={(event) =>
                        setSelected((previous) => {
                          const next = new Set(previous);
                          if (event.target.checked) next.add(endpoint);
                          else next.delete(endpoint);
                          return next;
                        })
                      }
                    />
                    <span className="font-mono min-w-0 break-all">
                      {endpoint}
                      {!endpoints.includes(endpoint) && (
                        <span className="text-error-500">
                          {" "}
                          {gatewayCopy("m079")}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              {!options.some((endpoint) =>
                endpoint.toLowerCase().includes(filter.trim().toLowerCase()),
              ) && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {gatewayCopy("m080")}
                </p>
              )}
            </div>
          </div>
          <Button
            type="submit"
            disabled={
              busy || (!app && !owners.some((owner) => owner.is_active))
            }
            aria-busy={busy}
            className="w-full"
          >
            {busy && <Loading kind="button" label={gatewayCopy("m081")} />}
            {busy ? "Saving app…" : "Save app"}
          </Button>
        </fieldset>
      </Form>
    </DialogContent>
  );
}

function OwnerAccess({ owner }: { owner: GatewayOwner }) {
  const gatewayCopy = useTranslations("gateway.copy");

  const fetcher = useFeatureForm<typeof action>();
  const busy = fetcher.state !== "idle";
  return (
    <Form
      method="post"
      submit={fetcher.submit}
      pending={fetcher.state !== "idle"}
      className="space-y-2"
    >
      <input type="hidden" name="intent" value="owner" />
      <input type="hidden" name="owner_user_id" value={owner.id} />
      <input
        type="hidden"
        name="api_access_enabled"
        value={owner.api_access_enabled ? "" : "on"}
      />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={busy || (!owner.is_active && !owner.api_access_enabled)}
        aria-busy={busy}
      >
        {busy && <Loading kind="button" label={gatewayCopy("m082")} />}
        {owner.api_access_enabled ? "Disable API access" : "Enable API access"}
      </Button>
      {!busy && fetcher.data?.error && (
        <p role="alert" className="text-xs text-error-500">
          {fetcher.data.error}
        </p>
      )}
    </Form>
  );
}
