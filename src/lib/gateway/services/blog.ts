import "server-only";
import { requireUser } from "@/lib/gateway/auth.server";
import type { LoaderFunctionArgs } from "@/lib/gateway/http.server";
import { z } from "zod";
import { backend } from "../backend.server";
import { blogCatalogSchema, type BlogApp } from "../blog";
import {
  postSchema,
  categoryListSchema,
  assetListSchema,
  type BlogEditorInitialData,
} from "../blog-client";
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  return {
    initialProfile: { name: user.name, email: user.email },
    membershipId: user.id,
    isAdmin: user.role === "admin",
    canCreate:
      user.role === "admin" ||
      Boolean(user.components?.includes("blog.create")),
    canUpdate:
      user.role === "admin" ||
      Boolean(user.components?.includes("blog.update")),
    canPublish:
      user.role === "admin" ||
      Boolean(user.components?.includes("blog.publish")),
  };
}

export async function loadEditorPost(
  request: Request,
  appKey: BlogApp["key"],
  id: number,
): Promise<BlogEditorInitialData> {
  const catalog = blogCatalogSchema.parse(await backend(request, "/blog/apps"));
  const app = catalog.apps.find(
    (item) => item.key === appKey && item.configured,
  );
  if (!app) throw new Response("Blog app not found", { status: 404 });
  const path = `/blog/apps/${appKey}`;
  const [saved, categories, assets, settings] = await Promise.all([
    backend(request, `${path}/posts/${id}`).then((data) =>
      z.object({ post: postSchema }).parse(data),
    ),
    backend(request, `${path}/categories?page_size=100`).then((data) =>
      categoryListSchema.parse(data),
    ),
    backend(request, `${path}/assets?page_size=100`).then((data) =>
      assetListSchema.parse(data),
    ),
    backend(request, `${path}/settings`).then((data) =>
      z.object({ public_blog_url: z.string().nullable() }).parse(data),
    ),
  ]);
  return {
    app,
    post: saved.post,
    categories: categories.items,
    assets: assets.assets,
    publicBlogUrl: settings.public_blog_url,
  };
}
