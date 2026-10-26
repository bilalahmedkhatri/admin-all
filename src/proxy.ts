import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
const intl = createMiddleware(routing);
export default async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const dev = process.env.NODE_ENV !== "production";
  let mediaOrigin = "";
  try {
    const parsed = new URL(process.env.BLOG_MEDIA_ORIGIN || "");
    if (parsed.protocol === "https:" && !parsed.username && !parsed.password)
      mediaOrigin = " " + parsed.origin;
  } catch {}
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'nonce-" +
      nonce +
      "' 'strict-dynamic'" +
      (dev ? " 'unsafe-eval'" : ""),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:" + mediaOrigin,
    "media-src 'self' blob:" + mediaOrigin,
    "frame-src https://www.youtube.com",
    "font-src 'self'",
    "connect-src 'self'" + (dev ? " ws: wss:" : ""),
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self' https://accounts.google.com",
    "frame-ancestors 'none'",
  ].join("; ");
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  const forwarded = new NextRequest(request, { headers });
  const response = await intl(forwarded);
  // next-intl rewrites must forward the trusted nonce headers too.
  response.headers.set("x-middleware-request-x-nonce", nonce);
  response.headers.set("x-middleware-request-content-security-policy", csp);
  const overrides = response.headers.get("x-middleware-override-headers");
  response.headers.set(
    "x-middleware-override-headers",
    [overrides, "x-nonce", "content-security-policy"].filter(Boolean).join(","),
  );
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  // Native form POSTs need their same-origin Origin; external requests still omit referrers.
  response.headers.set("Referrer-Policy", "same-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  return response;
}
export const config = {
  matcher: ["/((?!_next|_vercel|images/|favicon.ico).*)"],
};
