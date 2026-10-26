import "server-only";
export async function readEndpointForm(request: Request) {
  const form = await request.formData();
  let bytes = 0;
  for (const [, value] of form) {
    bytes += typeof value === "string" ? Buffer.byteLength(value) : value.size;
    if (typeof value !== "string" && value.size > 20 * 1024 * 1024)
      throw new Response("File is too large", { status: 413 });
  }
  if (bytes > 22 * 1024 * 1024)
    throw new Response("Request is too large", { status: 413 });
  return form;
}
