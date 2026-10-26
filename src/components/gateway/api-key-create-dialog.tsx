"use client";
import { useTranslations } from "next-intl";

import { submitFeature } from "@/lib/gateway/actions";
import {
  Form,
  useRefresh,
} from "@/components/gateway/forms";
import { useEffect, useRef, useState } from "react";
import { Check, Copy, KeyRound } from "@/components/gateway/icons";
import { Field, Notice, Submit } from "@/components/gateway/shared";
import { Loading } from "@/components/gateway/loading";
import { Button } from "@/components/gateway/ui/button";
import { Input } from "@/components/gateway/ui/input";
import { Label } from "@/components/gateway/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/gateway/ui/dialog";

export function ApiKeyCreateDialog({
  enabled,
  unlocked: activated,
  onCreated,
}: {
  enabled: boolean;
  unlocked: boolean;
  onCreated: () => void;
}) {
  const gatewayCopy = useTranslations("gateway.copy");

  const revalidator = useRefresh();
  const [open, setOpen] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [unlocked, setUnlocked] = useState(activated);
  const secretInput = useRef<HTMLInputElement>(null);
  async function copySecret() {
    if (!secret) return;
    setError(null);
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(secret);
      setCopied(true);
    } catch {
      secretInput.current?.focus();
      secretInput.current?.select();
      try {
        if (document.execCommand("copy")) {
          setCopied(true);
          return;
        }
      } catch {
        /* Keep the selected key available for manual copy. */
      }
      setError(
        "Your browser blocked clipboard access. The key is selected; press Ctrl+C or use Copy from the selection menu.",
      );
    }
  }
  function changeOpen(next: boolean) {
    if (busy) return;
    setSecret(null);
    setError(null);
    setCopied(false);
    setOpen(next);
  }
  useEffect(() => {
    const clear = () => setSecret(null);
    window.addEventListener("pagehide", clear);
    window.addEventListener("pageshow", clear);
    return () => {
      window.removeEventListener("pagehide", clear);
      window.removeEventListener("pageshow", clear);
    };
  }, []);
  async function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError(null);
    setCopied(false);
    try {
      const result = await submitFeature("/api-keys", "", new FormData(form));
      if (!result.secret)
        throw new Error(result.error || "Unable to generate API key");
      setSecret(result.secret);
      setUnlocked(true);
      form.reset();
      onCreated();
      revalidator.revalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to generate API key");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 rounded-lg px-5">
          <KeyRound className="size-4" />
          {gatewayCopy("m012")}
        </Button>
      </DialogTrigger>
      <DialogContent closeDisabled={busy}>
        <div className="space-y-2 pe-6">
          <DialogTitle className="text-xl font-semibold">
            {secret ? "Save your secret key" : "Create API key"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            {secret
              ? "Copy this key now. Closing this popup or reloading the page removes it permanently."
              : "Name your key so you can recognize the application using it."}
          </DialogDescription>
        </div>
        {error && <Notice error>{error}</Notice>}
        {secret ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="generated-api-secret">
                {gatewayCopy("m013")}
              </Label>
              <Input
                ref={secretInput}
                id="generated-api-secret"
                data-testid="generated-secret"
                value={secret}
                readOnly
                autoComplete="off"
                spellCheck={false}
                onFocus={(event) => event.currentTarget.select()}
                className="font-mono text-xs"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={copySecret}>
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied ? "Copied" : "Copy API key"}
              </Button>
              <Button variant="outline" onClick={() => changeOpen(false)}>
                {gatewayCopy("m014")}
              </Button>
            </div>
          </>
        ) : !enabled ? (
          <Notice>{gatewayCopy("m015")}</Notice>
        ) : (
          <Form method="post" onSubmit={generate} className="space-y-5">
            <Field
              name="name"
              label={gatewayCopy("m016")}
              required
              minLength={2}
              maxLength={128}
              placeholder={gatewayCopy("m017")}
            />
            {!unlocked && (
              <Field
                name="master_key"
                label={gatewayCopy("m018")}
                type="password"
                required
                autoComplete="off"
                maxLength={256}
                description={gatewayCopy("m019")}
              />
            )}
            <Submit disabled={busy}>
              {busy && <Loading kind="button" label={gatewayCopy("m020")} />}
              {gatewayCopy("m021")}
            </Submit>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
