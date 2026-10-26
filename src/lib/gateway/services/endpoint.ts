import "server-only";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@/lib/gateway/http.server";
import { checkOrigin, requireUser } from "@/lib/gateway/auth.server";
import { catalog, execute } from "@/lib/gateway/gateway.server";
import { endpoints, canExecute } from "@/lib/gateway/openapi";
import { credentialList } from "@/lib/gateway/credentials.server";
import { canViewEndpoint } from "@/lib/gateway/permissions";
import { readEndpointForm } from "@/lib/gateway/form.server";
export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const meta = await catalog(request);
  const all = endpoints(meta.spec).filter((e) => canViewEndpoint(user, e));
  const endpoint = all.find((e) => e.id === params.id);
  if (!endpoint) throw new Response("Endpoint not found", { status: 404 });
  const allowed = canExecute(user, endpoint);
  return {
    endpoint,
    related: all.filter((e) => e.path === endpoint.path),
    spec: {
      ...meta.spec,
      paths: Object.fromEntries(
        all.map((e) => [
          e.path,
          Object.fromEntries(
            all
              .filter((op) => op.path === e.path)
              .map((op) => [
                op.method.toLowerCase(),
                meta.spec.paths[e.path][op.method.toLowerCase()],
              ]),
          ),
        ]),
      ),
    },
    live: meta.live,
    error: meta.error,
    allowed,
    admin: user.role === "admin",
    credentials: allowed
      ? (await credentialList(request))
          .filter(
            (c) =>
              c.kind === endpoint.auth &&
              (user.role === "admin" ||
                (JSON.parse(user.credential_ids) as number[]).includes(c.id)),
          )
          .map((c) => ({ id: c.id, label: c.label }))
      : [],
  };
}
export async function action({ request, params }: ActionFunctionArgs) {
  checkOrigin(request);
  const user = await requireUser(request, ["admin", "operator"]);
  const meta = await catalog(request);
  const endpoint = endpoints(meta.spec).find((e) => e.id === params.id);
  if (!endpoint) throw new Response("Endpoint not found", { status: 404 });
  if (!canExecute(user, endpoint))
    throw new Response("Endpoint permission denied", { status: 403 });
  try {
    return json(
      await execute(request, user, endpoint, await readEndpointForm(request)),
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (e) {
    if (e instanceof Response) throw e;
    return json(
      {
        status: 400,
        elapsed: 0,
        result: null,
        error:
          e instanceof SyntaxError
            ? "Enter valid JSON for the request body."
            : e instanceof Error
              ? e.message
              : "Invalid request.",
      },
      { status: 400 },
    );
  }
}
