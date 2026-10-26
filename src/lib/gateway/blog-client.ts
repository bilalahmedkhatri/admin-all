import { z } from "zod";
import type { ImageAttribution } from "@/components/blog/imageAttribution";
export const categorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
});
export const assetSchema = z.object({
  id: z.number().int().positive(),
  public_url: z.string().url(),
  media_type: z.string(),
  original_filename: z.string(),
  size_bytes: z.number(),
});
export const postSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  locale: z.string(),
  version: z.number().int().positive(),
  status: z.enum(["draft", "published", "archived"]),
  category_id: z.number().nullable(),
  cover_asset_id: z.number().nullable(),
  author_name: z.string(),
  author_designation: z.string().nullable(),
  content_json: z.record(z.unknown()).optional(),
  metadata_json: z.record(z.unknown()),
  updated_at: z.string(),
});
export type BlogPost = z.infer<typeof postSchema>;
export type BlogCategory = z.infer<typeof categorySchema>;
export type BlogAsset = z.infer<typeof assetSchema> & { alt_text?: string; attribution?: ImageAttribution };
export class BlogRequestError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function blogRequest<T>(
  app: string,
  resource: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
  extra: Record<string, string> = {},
): Promise<T> {
  const query = new URLSearchParams({ app, resource, ...extra });
  const response = await fetch("/blog-editor/api?" + query, {
    ...init,
    cache: "no-store",
    credentials: "same-origin",
  });
  const data: unknown = await response.json();
  if (!response.ok)
    throw new BlogRequestError(
      z.object({ error: z.string() }).safeParse(data).data?.error ||
        "Blog request failed",
      response.status,
    );
  const result = schema.safeParse(data);
  if (!result.success) throw new Error("Invalid blog response");
  return result.data;
}

export const postListSchema = z.object({
  items: z.array(postSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
});
export const categoryListSchema = z.object({
  items: z.array(categorySchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
});

export const assetListSchema = z.object({
  assets: z.array(assetSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  page_size: z.number().int().positive(),
});

export const authorProfileSchema = z.object({
  name: z.string(),
  designation: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  description: z.string().nullable(),
  complete: z.boolean(),
  missing_fields: z.array(z.string()),
});
export type AuthorProfile = z.infer<typeof authorProfileSchema>;

export const avatarUploadSchema = z.object({
  url: z
    .string()
    .url()
    .refine(
      (value) => new URL(value).protocol === "https:",
      "Expected a public HTTPS avatar URL",
    ),
});
