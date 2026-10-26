import "server-only";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@/lib/gateway/http.server";
import { requireUser, checkOrigin } from "@/lib/gateway/auth.server";
import { backend } from "@/lib/gateway/backend.server";
import type { AppsCatalog } from "@/lib/gateway/authorized-apps";
export const headers = () => ({ "Cache-Control": "no-store" });
export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request, ["admin"]);
  return json(await backend<AppsCatalog>(request, "/authorized-apps"), {
    headers: headers(),
  });
}
export async function action({ request }: ActionFunctionArgs) {
  checkOrigin(request);
  await requireUser(request, ["admin"]);
  const form = await request.formData();
  try {
    const intent = form.get("intent");
    const identifier = (field: string) => {
      const id = Number(form.get(field));
      if (!Number.isSafeInteger(id) || id < 1)
        throw new Response("Invalid app or gateway owner", { status: 400 });
      return id;
    };
    if (intent === "owner") {
      await backend(
        request,
        `/authorized-apps/owners/${identifier("owner_user_id")}/permission`,
        {
          method: "PATCH",
          body: JSON.stringify({
            api_access_enabled: form.get("api_access_enabled") === "on",
          }),
        },
      );
    } else if (intent === "create" || intent === "update") {
      const body = {
        allowed_endpoints: form.getAll("allowed_endpoints"),
        is_approved: form.get("is_approved") === "on",
        ...(intent === "create"
          ? {
              name: String(form.get("name") || "").trim(),
              owner_user_id: identifier("owner_user_id"),
              allowed_origin: String(form.get("allowed_origin") || "").trim(),
            }
          : { is_active: form.get("is_active") === "on" }),
      };
      await backend(
        request,
        `/authorized-apps${intent === "update" ? `/${identifier("id")}` : ""}`,
        {
          method: intent === "create" ? "POST" : "PATCH",
          body: JSON.stringify(body),
        },
      );
    } else throw new Response("Unknown app action", { status: 400 });
    return json({ success: true, error: null }, { headers: headers() });
  } catch (error) {
    return json(
      {
        success: false,
        error:
          error instanceof Response
            ? await error.text()
            : "Unable to save app settings",
      },
      {
        status: error instanceof Response ? error.status : 400,
        headers: headers(),
      },
    );
  }
}
