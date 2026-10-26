import "server-only";
import { backend } from "./backend.server";
import type { Credential } from "./types";
export type { Credential } from "./types";
export async function credentialList(request: Request) {
  return (
    await backend<{ credentials: Credential[] }>(
      request,
      "/operation-credentials",
    )
  ).credentials;
}
