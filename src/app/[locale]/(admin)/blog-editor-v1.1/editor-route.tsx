import { setRequestLocale } from "next-intl/server";
import BlogWorkspace from "@/components/blog/BlogWorkspace";
import { loader, loadEditorPost } from "@/lib/gateway/services/blog";
import { pageRequest } from "@/lib/gateway/runtime.server";
import { loadPage } from "@/lib/gateway/load-page.server";
import type { BlogApp } from "@/lib/gateway/blog";

export async function renderBlogEditor(
  locale: string,
  target?: { app: BlogApp["key"]; id: number },
  apiEndpoint = "/blog-editor-v1.1/api",
) {
  setRequestLocale(locale);
  const request = await pageRequest("/blog-editor");
  const data = await loadPage(() => loader({ request, params: {} }));
  const initialPost = target
    ? await loadPage(() =>
        loadEditorPost(request, target.app, target.id, "v1.1"),
      )
    : undefined;
  return (
    <BlogWorkspace
      {...data}
      initialPost={initialPost}
      apiEndpoint={apiEndpoint}
      basePath="/blog-editor-v1.1"
    />
  );
}
