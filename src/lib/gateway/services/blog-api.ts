import "server-only";
import { z } from "zod";
import { checkOrigin } from "../auth.server";
import { backend } from "../backend.server";
import { blogAppKeys, blogCatalogSchema } from "../blog";

export async function handleBlog(request: Request): Promise<Response> {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    if (request.method !== "GET") checkOrigin(request);
    // The allowlisted blog endpoint validates the forwarded session and live
    // page/app/operation grants. Avoid a duplicate /me roundtrip here.
    const url = new URL(request.url);
    const resource = url.searchParams.get("resource");
    const key = z.enum(blogAppKeys).safeParse(url.searchParams.get("app"));
    const id = url.searchParams.get("id");
    if (id !== null && !/^[1-9][0-9]{0,9}$/.test(id))
      throw new Response("Invalid post ID", { status: 400 });
    if (
      !resource ||
      ![
        "posts",
        "categories",
        "assets",
        "settings",
        "profile",
        "apps",
        "avatar",
      ].includes(resource) ||
      (!["profile", "apps", "avatar"].includes(resource) && !key.success)
    )
      throw new Response("Invalid blog resource", { status: 400 });
    const method = request.method;
    if (
      !["GET", "POST", "PATCH"].includes(method) ||
      (method === "PATCH" &&
        !(resource === "profile" || (resource === "posts" && id))) ||
      (method === "POST" &&
        !["posts", "categories", "assets", "avatar"].includes(resource)) ||
      (resource === "avatar" && method !== "POST") ||
      (id && resource !== "posts")
    )
      throw new Response("Unsupported blog operation", { status: 405 });
    let path = ["profile", "apps", "avatar"].includes(resource)
      ? resource === "avatar"
        ? "/blog/profile/avatar"
        : `/blog/${resource}`
      : `/blog/apps/${key.success ? key.data : ""}/${resource}${id ? "/" + id : ""}`;
    const query = new URLSearchParams();
    for (const field of [
      "page",
      "page_size",
      "search",
      "locale",
      "status",
      "filename",
      "media_type",
    ]) {
      const value = url.searchParams.get(field);
      if (value !== null) query.set(field, value);
    }
    if (query.size) path += "?" + query;
    let init: RequestInit & { duplex?: "half" } = { method };
    if (method !== "GET") {
      const upload = resource === "assets" || resource === "avatar";
      const limit = resource === "assets" ? 64 * 1024 * 1024 : 2 * 1024 * 1024;
      const declared = request.headers.get("Content-Length");
      if (
        declared &&
        (!/^\d{1,12}$/.test(declared) || Number(declared) > limit)
      )
        throw new Response("Request too large", { status: 413 });
      if (!request.body)
        throw new Response("Missing request body", { status: 400 });
      const reader = request.body.getReader();
      let size = 0;
      const body = new ReadableStream<Uint8Array>({
        async pull(controller) {
          const chunk = await reader.read();
          if (chunk.done) {
            controller.close();
            return;
          }
          size += chunk.value.byteLength;
          if (size > limit) {
            await reader.cancel();
            controller.error(new Error("Request too large"));
            return;
          }
          controller.enqueue(chunk.value);
        },
        cancel(reason) {
          return reader.cancel(reason);
        },
      });
      init = {
        method,
        body,
        duplex: "half",
        headers: {
          "Content-Type":
            request.headers.get("Content-Type") || "application/json",
          ...(upload
            ? {
                "Idempotency-Key": request.headers.get("Idempotency-Key") || "",
              }
            : {}),
        },
      };
    }
    const data = await backend<unknown>(request, path, init);
    return Response.json(
      resource === "apps" ? blogCatalogSchema.parse(data) : data,
      { headers },
    );
  } catch (error) {
    if (error instanceof Response)
      return Response.json(
        {
          error:
            error.status >= 300 && error.status < 400
              ? "Sign in to continue"
              : await error.text(),
        },
        {
          status:
            error.status >= 300 && error.status < 400 ? 401 : error.status,
          headers,
        },
      );
    return Response.json(
      { error: "Blog request could not be completed" },
      { status: 503, headers },
    );
  }
}
