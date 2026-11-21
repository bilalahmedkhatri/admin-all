import { handleBlog } from "@/lib/gateway/services/blog-api";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;
// v1.1 route: routes through the v1.1 additive blog gateway contract
const handler = (request: Request) => handleBlog(request, "v1.1");
export const GET = handler;
export const POST = handler;
export const PATCH = handler;

