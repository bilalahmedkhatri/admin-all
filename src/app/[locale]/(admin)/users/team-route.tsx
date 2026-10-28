import { FeatureForms } from "@/components/gateway/forms";
import Team, { type TeamSection } from "@/components/gateway/pages/users";
import { loadPage } from "@/lib/gateway/load-page.server";
import { pageRequest } from "@/lib/gateway/runtime.server";
import { loader } from "@/lib/gateway/services/users";

export async function renderTeamSection(
  section: TeamSection,
  searchParams: Promise<Record<string, string | string[] | undefined>>,
) {
  const query = await searchParams;
  const route = "/users";
  const request = await pageRequest(route, query);
  const data = await loadPage(() => loader({ request, params: { id: "" } }));

  return (
    <FeatureForms path={route} search={new URL(request.url).search.slice(1)}>
      <Team data={data} section={section} />
    </FeatureForms>
  );
}
