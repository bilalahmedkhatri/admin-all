"use client";
import DatabaseBlogEditor from "./DatabaseBlogEditor";
export default function BlogWorkspace(props: {
  membershipId: number;
  initialProfile: { name: string; email: string };
  canCreate: boolean;
  canUpdate: boolean;
  canPublish: boolean;
}) {
  return <DatabaseBlogEditor key={props.membershipId} {...props} />;
}
