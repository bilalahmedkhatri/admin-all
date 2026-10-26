type Applicant = { id: number; email: string; name: string; status: string };
export type PendingAccess = {
  email: string;
  name: string;
  verification: string;
  reviewPath: string;
};

// Include invited/pending members as well as public registration requests,
// with one review item per email when both records exist.
export function pendingAccess(team: {
  requests: (Applicant & { email_verified: boolean })[];
  users: Applicant[];
}): PendingAccess[] {
  const requests = team.requests.filter((r) => r.status === "pending");
  const emails = new Set(requests.map((r) => r.email.toLowerCase()));
  return [
    ...requests.map((r) => ({
      email: r.email,
      name: r.name,
      verification: r.email_verified
        ? "Verified email"
        : "Awaiting email verification",
      reviewPath: `/users#request-${r.id}`,
    })),
    ...team.users
      .filter(
        (u) => u.status === "pending" && !emails.has(u.email.toLowerCase()),
      )
      .map((u) => ({
        email: u.email,
        name: u.name,
        verification: "Membership approval",
        reviewPath: `/users#member-${u.id}`,
      })),
  ];
}
