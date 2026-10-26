import "server-only";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@/lib/gateway/http.server";
import { requireUser, checkOrigin } from "@/lib/gateway/auth.server";
import { backend } from "@/lib/gateway/backend.server";
export type ProviderModel = {
  id: number;
  name: string;
  provider: string;
  is_active: boolean;
  is_free: boolean;
  prompt_price_per_1k: number;
  completion_price_per_1k: number;
  created_at: string;
};
export const headers = () => ({ "Cache-Control": "no-store" });
export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request, ["admin"]);
  return json(
    await backend<{ models: ProviderModel[]; providers: string[] }>(
      request,
      "/provider-models",
    ),
    { headers: headers() },
  );
}
export async function action({ request }: ActionFunctionArgs) {
  checkOrigin(request);
  await requireUser(request, ["admin"]);
  const form = await request.formData();
  try {
    const name = String(form.get("name") || "").trim();
    const provider = String(form.get("provider") || "").trim();
    if (!name || name.length > 128 || /\s/.test(name))
      throw new Response(
        "Enter a model ID up to 128 characters without spaces.",
        { status: 400 },
      );
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(provider))
      throw new Response("Select a saved provider.", { status: 400 });
    const free = form.get("is_free") === "on";
    const price = (field: string) => {
      if (free) return 0;
      const raw = form.get(field);
      const value = typeof raw === "string" && raw.trim() ? Number(raw) : NaN;
      if (!Number.isFinite(value) || value < 0)
        throw new Response(
          "Enter valid input and output prices of zero or greater.",
          { status: 400 },
        );
      return value;
    };
    await backend(request, "/provider-models", {
      method: "POST",
      body: JSON.stringify({
        name,
        provider,
        is_active: form.get("is_active") === "on",
        is_free: free,
        prompt_price_per_1k: price("prompt_price_per_1k"),
        completion_price_per_1k: price("completion_price_per_1k"),
      }),
    });
    return json({ success: true, error: null }, { headers: headers() });
  } catch (error) {
    return json(
      {
        success: false,
        error:
          error instanceof Response
            ? await error.text()
            : "Unable to add model",
      },
      {
        status: error instanceof Response ? error.status : 400,
        headers: headers(),
      },
    );
  }
}
