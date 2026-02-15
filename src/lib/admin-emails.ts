/**
 * Parse LINK360_ADMIN_EMAILS env (comma-separated) into a list of lowercased emails.
 * Use for allowlist checks and admin notification recipients.
 */
export function getAdminEmails(envValue?: string): string[] {
  return (envValue ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}
