"use server";
import { headers } from "next/headers";
import { refresh } from "next/cache";
import { pageRequest, handleResponse } from "./runtime.server";
import { checkOrigin } from "./auth.server";
import { action as keys } from "./services/api-keys";
import { action as apps } from "./services/apps";
import { action as models } from "./services/models";
import { action as users } from "./services/users";
import { action as settings } from "./services/settings";
import { action as endpoint } from "./services/endpoint";
import { action as register } from "./services/register";
import { action as verification } from "./services/verify-email";
const operations = {
  "/api-keys": keys,
  "/apps": apps,
  "/models": models,
  "/users": users,
  "/settings": settings,
  "/register": register,
  "/verify-email": verification,
};
export type ActionResult = {
  success?: boolean;
  error?: string | null;
  secret?: string | null;
  status?: number;
  elapsed?: number;
  result?: unknown;
};
export async function submitFeature(
  path: string,
  id: string,
  form: FormData,
): Promise<ActionResult> {
  // Bound arguments are untrusted too: allow only explicit operations.
  if (
    typeof path !== "string" ||
    typeof id !== "string" ||
    !(form instanceof FormData)
  )
    return { error: "Invalid operation" };
  const operation = Object.hasOwn(operations, path)
    ? operations[path as keyof typeof operations]
    : path === "/endpoints" && /^[a-zA-Z0-9_-]{1,200}$/.test(id)
      ? endpoint
      : null;
  if (!operation) return { error: "Operation not found" };
  const source = await pageRequest(
    path === "/endpoints" ? path + "/" + encodeURIComponent(id) : path,
  );
  try {
    checkOrigin(source);
  } catch {
    return { error: "Invalid request origin", status: 403 };
  }
  let size = 0;
  for (const [name, value] of form) {
    if (name.length > 256) return { error: "Invalid form field" };
    size += typeof value === "string" ? Buffer.byteLength(value) : value.size;
    if (typeof value !== "string" && value.size > 20 * 1024 * 1024)
      return { error: "File is too large" };
  }
  if (size > 22 * 1024 * 1024) return { error: "Request is too large" };
  for (const name of ["id", "owner_user_id"]) {
    const value = form.get(name);
    if (
      value !== null &&
      (typeof value !== "string" ||
        !/^\d{1,16}$/.test(value) ||
        !Number.isSafeInteger(Number(value)) ||
        Number(value) < 1)
    )
      return { error: "Invalid identifier" };
  }
  const h = new Headers(await headers());
  h.delete("content-type");
  h.delete("content-length");
  const request = new Request(source.url, {
    method: "POST",
    headers: h,
    body: form,
  });
  let result;
  try {
    result = await operation({ request, params: { id } });
  } catch (error) {
    if (error instanceof Response) {
      if (error.headers.has("Location")) {
        result = error;
      } else
        return {
          error:
            error.status >= 500
              ? "Backend could not complete this request. Please retry."
              : await error.text(),
          status: error.status,
        };
    }
    // Never serialize unexpected exceptions or upstream configuration to the client.
    if (!(error instanceof Response))
      return { error: "Unable to complete this action. Please retry." };
  }
  if (result instanceof Response) return await handleResponse(result);
  refresh();
  return result ?? { error: "Unable to complete this action" };
}
