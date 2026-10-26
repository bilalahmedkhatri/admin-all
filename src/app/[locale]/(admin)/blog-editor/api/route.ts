import { handleBlog } from "@/lib/gateway/services/blog-api";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;
export const GET = handleBlog;
export const POST = handleBlog;
export const PATCH = handleBlog;
