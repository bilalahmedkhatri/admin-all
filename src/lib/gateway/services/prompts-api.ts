import "server-only";
import { checkOrigin } from "../auth.server";
import { backend } from "../backend.server";

const VALID_IDS = /^[1-9][0-9]{0,9}$/;

export async function handlePrompts(request: Request): Promise<Response> {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (id !== null && !VALID_IDS.test(id))
      throw new Response("Invalid prompt ID", { status: 400 });

    const method = request.method;
    if (!["GET", "POST", "PATCH", "DELETE"].includes(method))
      throw new Response("Method not allowed", { status: 405 });

    if (method !== "GET") checkOrigin(request);

    // Build backend path
    let path = "/prompts" + (id ? `/${id}` : "");
    if (method === "GET") {
      const qs = new URLSearchParams();
      const page = url.searchParams.get("page");
      if (page) qs.set("page", page);
      if (qs.size) path += "?" + qs;
    }

    let init: RequestInit = { method };
    if (method === "POST" || method === "PATCH") {
      if (!request.body) throw new Response("Missing body", { status: 400 });
      const text = await request.text();
      if (text.length > 100_000) throw new Response("Request too large", { status: 413 });
      init = { method, body: text, headers: { "Content-Type": "application/json" } };
    }

    const data = await backend<unknown>(request, path, init);
    return Response.json(data, { headers });
  } catch (error) {
    if (error instanceof Response) {
      const body = await error.text();
      return Response.json(
        { detail: error.status >= 300 && error.status < 400 ? "Sign in to continue" : body },
        { status: error.status >= 300 && error.status < 400 ? 401 : error.status, headers },
      );
    }
    return Response.json({ detail: "Request could not be completed" }, { status: 503, headers });
  }
}
