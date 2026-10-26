import "server-only";
import { headers, cookies } from "next/headers";
import { redirect } from "@/i18n/navigation";
import { forbidden, notFound, unstable_rethrow } from "next/navigation";
import { adminOrigin } from "./config.server";
export async function pageRequest(
  path: string,
  search?: Record<string, string | string[] | undefined>,
) {
  const url = new URL(path, adminOrigin());
  for (const [key, value] of Object.entries(search || {})) {
    if (Array.isArray(value))
      value.forEach((v) => url.searchParams.append(key, v));
    else if (value !== undefined) url.searchParams.set(key, value);
  }
  return new Request(url, { headers: new Headers(await headers()) });
}
export async function handleResponse(value: unknown): Promise<never> {
  if (value instanceof Response) {
    const location = value.headers.get("Location");
    if (location) {
      const jar = await cookies();
      for (const entry of value.headers.getSetCookie()) {
        const [pair, ...attributes] = entry.split(";");
        const at = pair.indexOf("=");
        const name = pair.slice(0, at);
        const token = pair.slice(at + 1);
        const maxAge = attributes
          .find((a) => a.trim().toLowerCase().startsWith("max-age="))
          ?.split("=")[1];
        jar.set(name, decodeURIComponent(token), {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: adminOrigin().startsWith("https:"),
          maxAge: maxAge ? Number(maxAge) : undefined,
        });
      }
      if (location.startsWith("/") && !location.startsWith("//"))
        redirect({ href: location, locale: "en" });
    }
  }
  if (value instanceof Response) return handlePageError(value);
  throw value;
}

export async function handlePageError(error: unknown): Promise<never> {
  unstable_rethrow(error);
  if (error instanceof Response) {
    const location = error.headers.get("Location");
    if (location?.startsWith("/") && !location.startsWith("//"))
      return handleResponse(error);
    if (error.status === 401) redirect({ href: "/login", locale: "en" });
    if (error.status === 403) forbidden();
    if (error.status === 404) notFound();
  }
  throw new Error("The requested page could not be loaded");
}
