import "server-only";
import { adminOrigin, gatewayURL } from "./config.server";
export { gatewayURL };
function cookie(name: string, maxAge: number) {
  return {
    async parse(header: string | null): Promise<string | null> {
      const value = header
        ?.split(";")
        .map((v) => v.trim())
        .find((v) => v.startsWith(name + "="))
        ?.slice(name.length + 1);
      if (!value || value.length > 8192) return null;
      try {
        const decoded: unknown = JSON.parse(
          Buffer.from(decodeURIComponent(value), "base64").toString("utf8"),
        );
        return typeof decoded === "string" &&
          decoded.length <= 4096 &&
          !/[\x00-\x1f\x7f]/.test(decoded)
          ? decoded
          : null;
      } catch {
        return null;
      }
    },
    async serialize(value: string, options?: { maxAge?: number }) {
      const secure = adminOrigin().startsWith("https:");
      return (
        name +
        "=" +
        encodeURIComponent(
          Buffer.from(JSON.stringify(value)).toString("base64"),
        ) +
        "; Path=/; HttpOnly; SameSite=Lax; Max-Age=" +
        (options?.maxAge ?? maxAge) +
        (secure ? "; Secure" : "")
      );
    },
  };
}
export const sessionCookie = cookie("gateway_dashboard_session", 8 * 3600);
export const flowCookie = cookie("gateway_dashboard_flow", 600);
export const verificationCookie = cookie("gateway_dashboard_verification", 600);
export async function backend<T>(
  request: Request,
  path: string,
  init: RequestInit = {},
  authenticated = true,
): Promise<T> {
  // A fixed dashboard prefix prevents caller-controlled URLs or credential forwarding.
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    /[\\\r\n#]/.test(path) ||
    path
      .split("?")[0]
      .split("/")
      .some((p) => {
        try {
          return [".", ".."].includes(decodeURIComponent(p));
        } catch {
          return true;
        }
      })
  )
    throw new Response("Invalid gateway operation", { status: 400 });
  const headers = new Headers(init.headers);
  if (authenticated) {
    const token = await sessionCookie.parse(request.headers.get("Cookie"));
    if (!token) throw new Response("Sign in to continue", { status: 401 });
    headers.set("Authorization", "Bearer " + token);
  }
  headers.set("Origin", adminOrigin());
  if (typeof init.body === "string")
    headers.set("Content-Type", "application/json");
  let response: Response;
  try {
    response = await fetch(new URL("/api/v1/dashboard" + path, gatewayURL()), {
      ...init,
      headers,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(
        path === "/blog/profile/avatar" ||
          (path.startsWith("/blog/apps/") &&
            path.split("?")[0].endsWith("/assets"))
          ? 155000
          : path.startsWith("/operations/")
            ? 65000
            : 20000,
      ),
    });
  } catch {
    throw new Response(
      "Backend could not complete this request. Please retry.",
      { status: 503 },
    );
  }
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new Response(
      response.status >= 500
        ? "Backend could not complete this request. Please retry."
        : typeof data?.detail === "string"
          ? data.detail
          : "Backend rejected this request",
      { status: response.status },
    );
  return data as T;
}
