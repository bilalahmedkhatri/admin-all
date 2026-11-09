import { renderBlogEditor } from "../editor-route";

export const dynamic = "force-dynamic";
export default async function NewBlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return renderBlogEditor((await params).locale);
}
