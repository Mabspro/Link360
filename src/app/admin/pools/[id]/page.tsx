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

  const { data: intakeDocs } = await supabase
    .from("intake_documents")
    .select("id, user_email, file_path, created_at")
    .eq("pool_id", id)
    .order("created_at", { ascending: false });

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
      {(intakeDocs?.length ?? 0) > 0 && (
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-zinc-800 mb-2">Packing list uploads</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left">
                <th className="py-2 font-medium">Email</th>
                <th className="py-2 font-medium">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {intakeDocs?.map((doc) => (
                <tr key={doc.id} className="border-b border-zinc-100">
                  <td className="py-2 text-zinc-700">{doc.user_email}</td>
                  <td className="py-2 text-zinc-500">
                    {new Date(doc.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
