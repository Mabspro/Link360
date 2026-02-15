import { createClient } from "@/lib/supabase/server";
import { getAdminEmails } from "@/lib/admin-emails";

export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const adminEmails = getAdminEmails(process.env.LINK360_ADMIN_EMAILS);
  const email = user.email.toLowerCase();
  if (!adminEmails.includes(email)) return null;
  return user;
}

export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  return getAdminEmails(process.env.LINK360_ADMIN_EMAILS).includes(email.trim().toLowerCase());
}
