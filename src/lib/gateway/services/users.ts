import "server-only";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@/lib/gateway/http.server";
import { checkOrigin, requireUser } from "@/lib/gateway/auth.server";
import { backend } from "@/lib/gateway/backend.server";
import type { AdminUser, Credential } from "@/lib/gateway/types";
type TeamData = {
  users: (AdminUser & { master_key: string | null })[];
  requests: {
    id: number;
    name: string;
    email: string;
    reason: string;
    status: string;
    email_verified: boolean;
  }[];
  pages: string[];
  sections: string[];
  components: string[];
  grants: string[];
};
export const headers = () => ({ "Cache-Control": "no-store" });
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request, ["admin"]);
  const [team, vault] = await Promise.all([
    backend<TeamData>(request, "/members"),
    backend<{ credentials: Credential[] }>(request, "/credentials"),
  ]);
  return json(
    {
      ...team,
      self: user.id,
      credentials: vault.credentials.filter((c) => c.kind === "app"),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function action({ request }: ActionFunctionArgs) {
  checkOrigin(request);
  await requireUser(request, ["admin"]);
  const form = await request.formData();
  try {
    const intent = form.get("intent");
    if (intent === "enable-api")
      await backend(request, `/members/${Number(form.get("id"))}/api-access`, {
        method: "POST",
      });
    else if (intent === "reject")
      await backend(
        request,
        `/access-requests/${Number(form.get("id"))}/reject`,
        { method: "POST" },
      );
    else {
      const permissions = [
        "page",
        "section",
        "component",
        "endpoint",
        "credential",
      ].flatMap((kind) =>
        form.getAll(kind).map((key) => ({
          resource_type: kind,
          resource_key: String(key),
          action: ["endpoint", "credential"].includes(kind)
            ? "execute"
            : "view",
        })),
      );
      const body = {
        role: String(form.get("role") || "viewer"),
        status:
          intent === "revoke"
            ? "revoked"
            : String(form.get("status") || "pending"),
        permissions,
        email: form.get("email"),
        name: form.get("name"),
      };
      await backend(
        request,
        intent === "invite" ? "/members" : `/members/${Number(form.get("id"))}`,
        {
          method: intent === "invite" ? "POST" : "PATCH",
          body: JSON.stringify(body),
        },
      );
    }
    return json({ success: true, error: null });
  } catch (error) {
    return json(
      {
        success: false,
        error:
          error instanceof Response
            ? await error.text()
            : "Unable to update access",
      },
      { status: error instanceof Response ? error.status : 400 },
    );
  }
}
