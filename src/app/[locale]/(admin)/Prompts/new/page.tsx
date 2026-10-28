import { pageRequest } from "@/lib/gateway/runtime.server";
import { currentUser } from "@/lib/gateway/auth.server";
import { fetchPrompt } from "@/lib/gateway/prompts.server";
import PromptEditorClient from "./PromptEditorClient";

export const dynamic = "force-dynamic";

export default async function NewPromptPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const editId = typeof query.id === "string" ? query.id : undefined;
  const editIdNum = editId ? parseInt(editId, 10) : undefined;

  let defaultAuthor = "Admin";
  let initialData = null;

  try {
    const request = await pageRequest("/Prompts/new");
    const user = await currentUser(request);
    if (user?.name) defaultAuthor = user.name;
    else if (user?.email) defaultAuthor = user.email.split("@")[0];

    if (editIdNum && !isNaN(editIdNum)) {
      initialData = await fetchPrompt(request, editIdNum);
    }
  } catch {
    // fallback to empty editor
  }

  return (
    <PromptEditorClient
      editId={editId}
      defaultAuthor={defaultAuthor}
      initialData={initialData}
    />
  );
}
