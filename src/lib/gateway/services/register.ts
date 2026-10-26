import "server-only";
import { json, type ActionFunctionArgs } from "@/lib/gateway/http.server";
import { checkOrigin } from "@/lib/gateway/auth.server";
import { backend } from "@/lib/gateway/backend.server";
import {
  completionResponse,
  type Completion,
} from "@/lib/gateway/google.server";
export async function action({ request }: ActionFunctionArgs) {
  checkOrigin(request);
  const form = await request.formData();
  try {
    return await completionResponse(
      await backend<Completion>(
        request,
        "/access-requests",
        {
          method: "POST",
          body: JSON.stringify({
            name: form.get("name"),
            email: form.get("email"),
            reason: form.get("reason"),
          }),
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
            : "Unable to submit your request",
      },
      { status: error instanceof Response ? error.status : 400 },
    );
  }
}
