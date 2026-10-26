"use client";
import { ProviderModels } from "@/components/gateway/provider-models";
import type { loader } from "@/lib/gateway/services/models";
export type ProviderModel = {
  id: number;
  name: string;
  provider: string;
  is_active: boolean;
  is_free: boolean;
  prompt_price_per_1k: number;
  completion_price_per_1k: number;
  created_at: string;
};
type PageData = Exclude<Awaited<ReturnType<typeof loader>>, Response>;
export default function Models({ data: pageData }: { data: PageData }) {
  return <ProviderModels {...pageData} />;
}
