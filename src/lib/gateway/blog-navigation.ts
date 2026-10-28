import type { BlogPost } from "./blog-client";

export function blogEditPath(app: string, id: number) {
  return `/blog-editor/edit/${encodeURIComponent(app)}/${id}`;
}

export function publishedBlogUrl(post: BlogPost) {
  if (
    post.status !== "published" ||
    typeof post.metadata_json.canonical_url !== "string"
  )
    return null;
  try {
    const url = new URL(post.metadata_json.canonical_url);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
