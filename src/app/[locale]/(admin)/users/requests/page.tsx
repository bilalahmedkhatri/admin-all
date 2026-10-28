import { renderTeamSection } from "../team-route";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return renderTeamSection("requests", searchParams);
}
