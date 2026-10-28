import BlogPageShell from "@/components/blog/BlogPageShell";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BlogPageShell>{children}</BlogPageShell>;
}
