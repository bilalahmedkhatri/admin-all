"use client";
import { useTranslations } from "next-intl";

import { useEffect, useRef, useState } from "react";
import { Form, useFeatureForm } from "@/components/gateway/forms";
import { Plus } from "@/components/gateway/icons";
import { Button } from "@/components/gateway/ui/button";
import { Input } from "@/components/gateway/ui/input";
import { Label } from "@/components/gateway/ui/label";
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
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/gateway/ui/table";
import { Field, Notice } from "@/components/gateway/shared";
import { Loading } from "@/components/gateway/loading";
import { keyDate } from "@/lib/gateway/api-keys";
import type { ProviderModel, action } from "@/lib/gateway/services/models";

export function ProviderModels({
  models,
  providers,
}: {
  models: ProviderModel[];
  providers: string[];
}) {
  const gatewayCopy = useTranslations("gateway.copy");

  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState("");
  const rows = models.filter(
    (model) =>
      (!provider || model.provider === provider) &&
      `${model.name} ${model.provider}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="space-y-10 pb-8">
      <header className="flex flex-wrap items-center justify-between gap-5">
        <h1 className="text-3xl font-semibold tracking-tight">
          {gatewayCopy("m233")}
        </h1>
        <CreateModel
          providers={providers}
          onCreated={() => {
            setSearch("");
            setProvider("");
          }}
        />
      </header>
      <p className="max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
        {gatewayCopy("m234")}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-5">
        <Input
          aria-label={gatewayCopy("m235")}
          placeholder={gatewayCopy("m236")}
          className="h-11 max-w-sm rounded-full px-5"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="flex items-center gap-3">
          <label
            htmlFor="provider-filter"
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {gatewayCopy("m041")}
          </label>
          <select
            id="provider-filter"
            className="focus:ring-ring h-11 min-w-44 rounded-full border bg-gray-50 px-5 text-sm focus:ring-2 focus:outline-none dark:bg-white/5"
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
          >
            <option value="">{gatewayCopy("m237")}</option>
            {[...new Set(models.map((model) => model.provider))]
              .sort()
              .map((value) => (
                <option key={value}>{value}</option>
              ))}
          </select>
        </div>
      </div>
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow>
            {[
              "Model",
              "Provider",
              "Pricing / 1K tokens",
              "Created",
              "Status",
            ].map((title) => (
              <TableHead key={title}>{title}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((model) => (
            <TableRow key={model.id}>
              <TableCell className="max-w-xs py-7 font-medium break-words text-brand-500">
                {model.name}
              </TableCell>
              <TableCell>{model.provider}</TableCell>
              <TableCell>
                {model.is_free ? (
                  "Free"
                ) : (
                  <span>
                    {gatewayCopy("m238")}
                    {model.prompt_price_per_1k}
                    <br />
                    {gatewayCopy("m239")}
                    {model.completion_price_per_1k}
                  </span>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {keyDate(model.created_at)}
              </TableCell>
              <TableCell>
                <Badge variant={model.is_active ? "secondary" : "outline"}>
                  {model.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {!rows.length && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-16 text-center text-gray-500 dark:text-gray-400"
              >
                {models.length
                  ? "No models match your search."
                  : "No provider models yet. Add your first model to get started."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {rows.length} {gatewayCopy("m059")}
        {models.length} {gatewayCopy("m240")}
      </p>
    </div>
  );
}

function CreateModel({
  providers,
  onCreated,
}: {
  providers: string[];
  onCreated: () => void;
}) {
  const gatewayCopy = useTranslations("gateway.copy");

  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 rounded-lg px-5">
          <Plus className="size-4" />
          {gatewayCopy("m241")}
        </Button>
      </DialogTrigger>
      {open && (
        <ModelForm
          providers={providers}
          onCreated={() => {
            setOpen(false);
            onCreated();
          }}
        />
      )}
    </Dialog>
  );
}

function ModelForm({
  providers,
  onCreated,
}: {
  providers: string[];
  onCreated: () => void;
}) {
  const gatewayCopy = useTranslations("gateway.copy");

  const fetcher = useFeatureForm<typeof action>();
  const busy = fetcher.state !== "idle";
  const submitting = useRef(false);
  const [free, setFree] = useState(false);
  useEffect(() => {
    if (fetcher.state === "idle") {
      submitting.current = false;
      if (fetcher.data?.success) onCreated();
    }
  }, [fetcher.state, fetcher.data, onCreated]);
  return (
    <DialogContent
      closeDisabled={busy}
      onEscapeKeyDown={(event) => {
        if (busy || submitting.current) event.preventDefault();
      }}
      onInteractOutside={(event) => {
        if (busy || submitting.current) event.preventDefault();
      }}
    >
      <div className="space-y-2 pe-6">
        <DialogTitle className="text-xl font-semibold">
          {gatewayCopy("m242")}
        </DialogTitle>
        <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
          {gatewayCopy("m243")}
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
        <fieldset disabled={busy} className="min-w-0 space-y-5">
          <Field
            name="name"
            label={gatewayCopy("m244")}
            placeholder={gatewayCopy("m245")}
            required
            maxLength={128}
            pattern={String.raw`\S+`}
          />
          <div className="space-y-2">
            <Label htmlFor="model-provider">{gatewayCopy("m246")}</Label>
            <select
              id="model-provider"
              name="provider"
              required
              defaultValue=""
              disabled={!providers.length}
              className="border-input focus:ring-ring flex h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white px-3 py-2 text-sm focus:ring-2 focus:outline-none disabled:opacity-50 dark:bg-gray-900"
            >
              <option value="" disabled>
                {gatewayCopy("m247")}
              </option>
              {providers.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {!providers.length && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {gatewayCopy("m248")}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="is_active" defaultChecked />
              {gatewayCopy("m074")}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_free"
                checked={free}
                onChange={(event) => setFree(event.target.checked)}
              />
              {gatewayCopy("m249")}
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              name="prompt_price_per_1k"
              label={gatewayCopy("m250")}
              type="number"
              min="0"
              step="any"
              required
              disabled={free}
              defaultValue="0"
            />
            <Field
              name="completion_price_per_1k"
              label={gatewayCopy("m251")}
              type="number"
              min="0"
              step="any"
              required
              disabled={free}
              defaultValue="0"
            />
          </div>
          {free && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {gatewayCopy("m252")}
            </p>
          )}
          <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
            {gatewayCopy("m253")}
          </p>
          <Button
            type="submit"
            disabled={busy || !providers.length}
            aria-busy={busy}
            className="w-full"
          >
            {busy && <Loading kind="button" label={gatewayCopy("m081")} />}
            {busy ? "Adding model…" : "Add model"}
          </Button>
        </fieldset>
      </Form>
    </DialogContent>
  );
}
