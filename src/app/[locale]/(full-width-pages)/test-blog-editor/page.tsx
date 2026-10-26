import BlogEditorView from "@/components/blog/BlogEditorView";
import { setRequestLocale } from "next-intl/server";

export default async function TestBlogEditorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <BlogEditorView />
      </div>
    </div>
  );
}
