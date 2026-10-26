import "server-only";
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@/lib/gateway/http.server";
import { checkOrigin } from "@/lib/gateway/auth.server";
import { backend, verificationCookie } from "@/lib/gateway/backend.server";
import {
  completionResponse,
  type Completion,
} from "@/lib/gateway/google.server";
export async function loader({ request }: LoaderFunctionArgs) {
  if (
    typeof (await verificationCookie.parse(request.headers.get("Cookie"))) !==
    "string"
  )
    return redirect("/login");
  return null;
}
export async function action({ request }: ActionFunctionArgs) {
  checkOrigin(request);
  const token = await verificationCookie.parse(request.headers.get("Cookie"));
  const form = await request.formData();
  try {
    return await completionResponse(
      await backend<Completion>(
        request,
        "/email-challenges/verify",
        {
          method: "POST",
          body: JSON.stringify({ token, code: form.get("code") }),
        },
        false,
      ),
    );
  } catch (error) {
    return json(
      {
        error:
          error instanceof Response
            ? await error.text()
            : "Verification failed",
      },
      { status: error instanceof Response ? error.status : 400 },
    );
  }
}
