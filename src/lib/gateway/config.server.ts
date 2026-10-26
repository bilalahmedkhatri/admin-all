import "server-only";
export function adminOrigin() {
  const value =
    process.env.ADMIN_ORIGIN ||
    (process.env.NODE_ENV === "production" ? "" : "http://localhost:3002");
  if (!value) throw new Error("ADMIN_ORIGIN is required");
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.origin !== value
  )
    throw new Error("Invalid ADMIN_ORIGIN");
  return value;
}
export function gatewayURL() {
  const value =
    process.env.GATEWAY_URL ||
    (process.env.NODE_ENV === "production" ? "" : "http://localhost:8000");
  if (!value) throw new Error("GATEWAY_URL is required");
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  )
    throw new Error("Invalid GATEWAY_URL");
  return url.origin;
}
