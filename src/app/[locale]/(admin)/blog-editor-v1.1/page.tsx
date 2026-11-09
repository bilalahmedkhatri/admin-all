import BlogPostsPage from "@/components/blog/BlogPostsPage";
import { setRequestLocale } from "next-intl/server";
import { loader } from "@/lib/gateway/services/blog";
import { pageRequest } from "@/lib/gateway/runtime.server";
import { loadPage } from "@/lib/gateway/load-page.server";
export const dynamic = "force-dynamic";
export default async function BlogEditorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const request = await pageRequest("/blog-editor");
  const data = await loadPage(() => loader({ request, params: {} }));
  return (
    <BlogPostsPage
      key={data.membershipId}
      isAdmin={data.isAdmin}
      canUpdate={data.canUpdate}
    />
  );
}
