import "server-only";
import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@/lib/gateway/http.server";
import { checkOrigin, requireUser } from "@/lib/gateway/auth.server";
import { backend } from "@/lib/gateway/backend.server";
import { gatewayURL } from "@/lib/gateway/gateway.server";
export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request, ["admin"]);
  const data = await backend<{
    credentials: import("@/lib/gateway/types").Credential[];
    configured: { admin: boolean; app: boolean; vault: boolean };
  }>(request, "/credentials");
  return {
    ...data,
    url: gatewayURL(),
    origin: process.env.ADMIN_ORIGIN || "http://localhost:3002",
  };
}
export async function action({ request }: ActionFunctionArgs) {
  checkOrigin(request);
  await requireUser(request, ["admin"]);
  const form = await request.formData();
  try {
    if (form.get("intent") === "delete")
      await backend(request, `/credentials/${Number(form.get("id"))}`, {
        method: "DELETE",
      });
    else
      await backend(request, "/credentials", {
        method: "POST",
        body: JSON.stringify({
          label: form.get("label"),
          kind: form.get("kind"),
          secret: form.get("secret"),
          origin: form.get("origin"),
        }),
      });
    return json({ success: true, error: null });
  } catch (error) {
    return json(
      {
        success: false,
        error:
          error instanceof Response
            ? await error.text()
            : "Unable to save credential",
      },
      { status: error instanceof Response ? error.status : 400 },
    );
  }
}
