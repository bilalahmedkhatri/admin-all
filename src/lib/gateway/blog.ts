import { z } from "zod";
export const blogAppKeys = [
  "azeemlab",
  "ailettergen",
  "bondsgame",
  "sikanderart",
  "e_sahulat",
  "genzee_video",
] as const;
export const blogCatalogSchema = z
  .object({
    apps: z.array(
      z
        .object({
          key: z.enum(blogAppKeys),
          label: z.string().min(1).max(80),
          configured: z.boolean(),
        })
        .strict(),
    ),
  })
  .strict();
export type BlogApp = z.infer<typeof blogCatalogSchema>["apps"][number];
export function blogDraftStorageKey(
  membershipId: number,
  appKey: BlogApp["key"],
) {
  if (
    !Number.isSafeInteger(membershipId) ||
    membershipId < 1 ||
    !blogAppKeys.includes(appKey)
  )
    throw new Error("Invalid blog draft scope");
  return `gateway_blog_drafts:${membershipId}:${appKey}`;
}
