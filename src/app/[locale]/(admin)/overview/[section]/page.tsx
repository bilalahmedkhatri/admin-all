import View from "@/components/gateway/pages/overview";
import { loader } from "@/lib/gateway/services/overview";
import { pageRequest } from "@/lib/gateway/runtime.server";
import { loadPage } from "@/lib/gateway/load-page.server";
import { FeatureForms } from "@/components/gateway/forms";
import {
  overviewSections,
  canViewOverviewSection,
} from "@/lib/gateway/overview-navigation";
import { requireUser } from "@/lib/gateway/auth.server";
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
  params,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  params: Promise<{ locale: string; section: string }>;
}) {
  const { section } = await params;
  const entry = overviewSections.find(
    (item) => item.id === section && item.id !== "summary",
  );
  const request = await pageRequest(
    entry?.path ?? "/overview/invalid",
    await searchParams,
  );
  const data = await loadPage(async () => {
    const user = await requireUser(request);
    if (!entry) throw new Response("Not found", { status: 404 });
    if (!canViewOverviewSection(user, entry.id))
      throw new Response("Page permission denied", { status: 403 });
    return loader({ request, params: {} });
  });
  if (!entry) return null;
  return (
    <FeatureForms
      path={entry.path}
      search={new URL(request.url).search.slice(1)}
    >
      <View data={data} section={entry.id} />
    </FeatureForms>
  );
}
