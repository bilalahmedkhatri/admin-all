"use client";
import DatabaseBlogEditor from "./DatabaseBlogEditor";
import type { BlogEditorInitialData } from "@/lib/gateway/blog-client";
export default function BlogWorkspace(props: {
  membershipId: number;
  initialProfile: { name: string; email: string };
  canCreate: boolean;
  canUpdate: boolean;
  canPublish: boolean;
  initialPost?: BlogEditorInitialData;
}) {
  return (
    <DatabaseBlogEditor
      key={`${props.membershipId}:${props.initialPost?.app.key ?? "new"}:${props.initialPost?.post.id ?? "new"}`}
      {...props}
    />
  );
}
