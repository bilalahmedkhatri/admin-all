import { handlePrompts } from "@/lib/gateway/services/prompts-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handlePrompts;
export const POST = handlePrompts;
export const PATCH = handlePrompts;
export const DELETE = handlePrompts;
