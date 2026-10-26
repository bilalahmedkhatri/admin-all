import type { JSONContent } from "@tiptap/core";
import { z } from "zod";
import { assetDocumentNode } from "./extensions/blogMedia";

const link = z.string().trim().max(2048).refine((value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch { return false; }
}, "Use a valid HTTPS link without credentials.");
export const imageAttributionSchema = z.object({
  credit: z.string().trim().max(200),
  sourceUrl: link,
  license: z.string().trim().max(200),
  licenseUrl: link,
}).superRefine((value, ctx) => {
  if (value.sourceUrl && !value.credit)
    ctx.addIssue({ code: "custom", path: ["credit"], message: "Add a creator or source name for the source link." });
  if (value.licenseUrl && !value.license)
    ctx.addIssue({ code: "custom", path: ["license"], message: "Add a license name for the license link." });
});
export type ImageAttribution = z.infer<typeof imageAttributionSchema>;
export const emptyAttribution: ImageAttribution = { credit: "", sourceUrl: "", license: "", licenseUrl: "" };

/** Visible attribution uses ordinary paragraph/text/link nodes, never image attributes. */
export function attributedImageContent(asset: Parameters<typeof assetDocumentNode>[0] & {
  attribution?: ImageAttribution;
}): JSONContent[] {
  const nodes = [assetDocumentNode(asset)];
  if (!asset.media_type.startsWith("image/") || !asset.attribution) return nodes;
  const attribution = imageAttributionSchema.parse(asset.attribution);
  const content: JSONContent[] = [];
  function append(text: string, href: string) {
    content.push({ type: "text", text, ...(href ? { marks: [{ type: "link", attrs: {
      href, target: "_blank", rel: "noopener noreferrer",
    } }] } : {}) });
  }
  if (attribution.credit) {
    append("Image credit: ", "");
    append(attribution.credit, attribution.sourceUrl);
  }
  if (attribution.license) {
    append(content.length ? " · License: " : "License: ", "");
    append(attribution.license, attribution.licenseUrl);
  }
  if (content.length) nodes.push({ type: "paragraph", content });
  return nodes;
}


export const coverImageDetailsSchema = z.object({
  alt_text: z.string().max(1000),
  attribution: imageAttributionSchema,
});
export type CoverImageDetails = z.infer<typeof coverImageDetailsSchema>;
export function savedCoverDetails(metadata: Record<string, unknown>, assetId: number | null): CoverImageDetails | null {
  const stored = metadata.cover_image as { asset_id?: number } | undefined;
  if (!assetId || stored?.asset_id !== assetId) return null;
  const parsed = coverImageDetailsSchema.safeParse(stored);
  return parsed.success ? parsed.data : null;
}
