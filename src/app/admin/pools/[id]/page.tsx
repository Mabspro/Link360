import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { PledgesTable } from "@/components/admin/PledgesTable";

export default async function AdminPoolDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const { status: statusFilter } = await searchParams;
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  const supabase = createServiceRoleClient();
  const { data: pool } = await supabase.from("pools").select("*").eq("id", id).single();
  if (!pool) notFound();

  let query = supabase
    .from("pledges")
    .select("*")
    .eq("pool_id", id)
    .order("created_at", { ascending: false });
  if (statusFilter) query = query.eq("status", statusFilter);
  const { data: pledges } = await query;

  const { data: stats } = await supabase
    .from("pool_stats")
    .select("*")
    .eq("pool_id", id)
    .single();

  return (
    <div>
      <Link href="/admin/dashboard" className="text-sm text-zinc-500 hover:underline">
        ← Dashboard
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{pool.title}</h1>
          <p className="text-zinc-600">
            {pool.destination_city} · {pool.container_type}
          </p>
        </div>
        <Link
          href={`/pool/${pool.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-emerald-600 hover:underline"
        >
          View public page →
        </Link>
      </div>
      {stats && (
        <div className="mt-4 flex flex-wrap gap-4 rounded-lg bg-white p-4 text-sm">
          <span>Total ft³: {Number(stats.total_ft3).toFixed(1)}</span>
          <span>Internal ft³: {Number(stats.total_internal_ft3).toFixed(1)}</span>
          <span>Est. revenue: ${Number(stats.est_revenue).toFixed(0)}</span>
          <span>Pledges: {stats.pledge_count}</span>
          <span>Fill: {Number(stats.pct_full).toFixed(0)}%</span>
        </div>
      )}
      <div className="mt-6">
        <PledgesTable
          poolId={id}
          pledges={pledges ?? []}
          statusFilter={statusFilter}
        />
      </div>
    </div>
  );
}
