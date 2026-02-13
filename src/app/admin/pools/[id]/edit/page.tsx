import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAdminUser } from "@/lib/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { PoolForm } from "@/components/admin/PoolForm";

export default async function EditPoolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  const supabase = createServiceRoleClient();
  const { data: pool } = await supabase.from("pools").select("*").eq("id", id).single();
  if (!pool) notFound();

  return (
    <div>
      <Link href="/admin/dashboard" className="text-sm text-zinc-500 hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900">Edit pool</h1>
      <PoolForm
        poolId={pool.id}
        defaultValues={{
          slug: pool.slug,
          title: pool.title,
          destination_city: pool.destination_city,
          container_type: pool.container_type,
          usable_ft3: Number(pool.usable_ft3),
          announce_threshold_pct: Number(pool.announce_threshold_pct),
          status: pool.status,
          is_public: pool.is_public,
        }}
      />
    </div>
  );
}
