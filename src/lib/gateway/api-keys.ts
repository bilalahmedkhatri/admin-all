export type KeyMetadata = {
  id: number;
  name: string;
  prefix: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
};
export type KeyFilter = "all" | "active" | "revoked";
export type KeyGrouping = "key" | "status";

export function keyGroups(
  keys: KeyMetadata[],
  filter: KeyFilter,
  grouping: KeyGrouping,
) {
  const filtered = keys.filter(
    (k) => filter === "all" || k.is_active === (filter === "active"),
  );
  if (grouping === "key") return [{ label: "", keys: filtered }];
  return [true, false]
    .map((active) => ({
      label: active ? "Active" : "Revoked",
      keys: filtered.filter((k) => k.is_active === active),
    }))
    .filter((group) => group.keys.length > 0);
}

export function keyDate(value: string | null) {
  return value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : "Never used";
}
