import "server-only";
import { redirect } from "@/lib/gateway/http.server";
import { createHash, randomBytes } from "node:crypto";
import {
  backend,
  flowCookie,
  sessionCookie,
  verificationCookie,
} from "./backend.server";
import type { AdminUser } from "./types";
import { landing } from "./permissions";
export type Completion = {
  session_token?: string;
  user?: AdminUser;
  requires_email_verification?: boolean;
  verification_token?: string;
  verified?: boolean;
};
export async function completionResponse(data: Completion) {
  if (data.requires_email_verification && data.verification_token)
    return redirect("/verify-email", {
      headers: {
        "Set-Cookie": await verificationCookie.serialize(
          data.verification_token,
        ),
        "Cache-Control": "no-store",
      },
    });
  if (!data.session_token || !data.user)
    return redirect("/pending", {
      headers: {
        "Set-Cookie": await verificationCookie.serialize("", { maxAge: 0 }),
      },
    });
  const headers = new Headers({
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
  });
  headers.append(
    "Set-Cookie",
    await sessionCookie.serialize(data.session_token),
  );
  headers.append("Set-Cookie", await flowCookie.serialize("", { maxAge: 0 }));
  headers.append(
    "Set-Cookie",
    await verificationCookie.serialize("", { maxAge: 0 }),
  );
  return redirect(landing(data.user), { headers });
}
export async function startGoogle(request: Request) {
  const browser = randomBytes(32).toString("hex");
  const result = await backend<{ authorization_url: string }>(
    request,
    "/auth/start",
    {
      method: "POST",
      body: JSON.stringify({
        browser_binding_hash: createHash("sha256")
          .update(browser)
          .digest("hex"),
      }),
    },
    false,
  );
  const url = new URL(result.authorization_url);
  if (url.origin !== "https://accounts.google.com")
    throw new Response("Invalid identity provider redirect", { status: 502 });
  return redirect(url.href, {
    headers: {
      "Set-Cookie": await flowCookie.serialize(browser),
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}
export async function finishGoogle(request: Request) {
  const browser = await flowCookie.parse(request.headers.get("Cookie"));
  const ticket = new URL(request.url).searchParams.get("ticket");
  if (typeof browser !== "string" || !ticket || ticket.length > 256)
    return redirect("/login?oauth=failed");
  try {
    return await completionResponse(
      await backend<Completion>(
        request,
        "/auth/exchange",
        {
          method: "POST",
          body: JSON.stringify({ ticket, browser_binding: browser }),
        },
        false,
      ),
    );
  } catch (error) {
    if (error instanceof Response && error.status === 403)
      return redirect("/login?oauth=denied");
    return redirect("/login?oauth=failed");
  }
}
