"use client";
import { AuthorizedAppsView } from "@/components/gateway/authorized-apps";
import type { loader } from "@/lib/gateway/services/apps";

type PageData = Exclude<Awaited<ReturnType<typeof loader>>, Response>;
export default function Apps({ data: pageData }: { data: PageData }) {
  return <AuthorizedAppsView {...pageData} />;
}
