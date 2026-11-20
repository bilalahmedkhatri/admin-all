import { handleBlog } from "@/lib/gateway/services/blog-api";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;
// v1 route: strips v1.1-only fields (blog_details) before forwarding to backend
const handler = (request: Request) => handleBlog(request, "v1");
export const GET = handler;
export const POST = handler;
export const PATCH = handler;
