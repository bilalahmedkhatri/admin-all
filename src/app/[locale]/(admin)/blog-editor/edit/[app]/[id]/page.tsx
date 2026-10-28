import { notFound } from "next/navigation";
import { z } from "zod";
import { blogAppKeys } from "@/lib/gateway/blog";
import { renderBlogEditor } from "../../../editor-route";

export const dynamic = "force-dynamic";
export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ locale: string; app: string; id: string }>;
}) {
  const values = await params;
  const target = z
    .object({
      app: z.enum(blogAppKeys),
      id: z
        .string()
        .regex(/^[1-9][0-9]{0,9}$/)
        .transform(Number)
        .pipe(z.number().int().max(2147483647)),
    })
    .safeParse(values);
  if (!target.success) notFound();
  return renderBlogEditor(values.locale, target.data);
}
