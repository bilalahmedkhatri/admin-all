import "server-only";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@/lib/gateway/http.server";
import { checkOrigin, requireUser } from "@/lib/gateway/auth.server";
import { backend } from "@/lib/gateway/backend.server";
import type { KeyMetadata } from "@/lib/gateway/api-keys";
const privateHeaders = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
};
export const headers = () => privateHeaders;
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const data = await backend<{
    enabled: boolean;
    unlocked: boolean;
    keys: KeyMetadata[];
  }>(request, "/api-keys");
  const isAdmin = user.role === "admin";
  return json(
    {
      ...data,
      isAdmin,
      enabled: isAdmin || data.enabled,
      unlocked: isAdmin || data.unlocked,
    },
    { headers: privateHeaders },
  );
}
export async function action({ request }: ActionFunctionArgs) {
  checkOrigin(request);
  await requireUser(request);
  const form = await request.formData();
  try {
    if (form.get("intent") === "revoke") {
      const id = Number(form.get("id"));
      if (!Number.isSafeInteger(id) || id < 1)
        throw new Response("Invalid API key", { status: 400 });
      await backend(request, `/api-keys/${id}`, { method: "DELETE" });
      return json(
        { success: true, secret: null, error: null },
        { headers: privateHeaders },
      );
    }
    const created = await backend<KeyMetadata & { secret: string }>(
      request,
      "/api-keys",
      {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          master_key: form.get("master_key") || null,
        }),
      },
    );
    return json(
      { success: true, secret: created.secret, error: null },
      { headers: privateHeaders },
    );
  } catch (error) {
    return json(
      {
        success: false,
        secret: null,
        error:
          error instanceof Response
            ? await error.text()
            : "Unable to update API keys",
      },
      {
        status: error instanceof Response ? error.status : 400,
        headers: privateHeaders,
      },
    );
  }
}
