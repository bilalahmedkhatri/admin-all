import "server-only";
export type LoaderFunctionArgs = {
  request: Request;
  params: Record<string, string>;
};
export type ActionFunctionArgs = LoaderFunctionArgs;
// Services return typed data; Next owns HTTP serialization and cache headers.
export function json<T>(data: T, _init?: ResponseInit): T {
  void _init;
  return data;
}
export function redirect(location: string, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  headers.set("Location", location);
  return new Response(null, { ...init, status: init?.status || 303, headers });
}
