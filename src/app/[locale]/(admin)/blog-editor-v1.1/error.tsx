"use client";
import BlogPageError from "@/components/blog/BlogPageError";

export default function ErrorPage({
  retry,
  reset,
}: {
  retry?: () => void;
  reset?: () => void;
}) {
  return <BlogPageError retry={() => (retry ?? reset)?.()} />;
}
