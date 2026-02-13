import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";

export default async function AdminRootPage() {
  const user = await getAdminUser();
  if (user) redirect("/admin/dashboard");
  redirect("/admin/login");
}
