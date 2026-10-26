"use client";
import { useFormResult } from "@/components/gateway/forms";
import { ApiKeysView } from "@/components/gateway/api-keys-view";
import type { loader, action } from "@/lib/gateway/services/api-keys";
import type { loader as workspaceLoader } from "@/lib/gateway/services/workspace";

type PageData = Exclude<Awaited<ReturnType<typeof loader>>, Response>;
type WorkspaceData = Awaited<ReturnType<typeof workspaceLoader>>;
export default function APIKeys({
  data: pageData,
  workspace,
}: {
  data: PageData;
  workspace?: WorkspaceData;
}) {
  const data = pageData;
  const result = useFormResult<typeof action>();
  return (
    <ApiKeysView
      {...data}
      pending={data.isAdmin ? workspace?.pendingRequests || [] : undefined}
      error={result?.error}
    />
  );
}
