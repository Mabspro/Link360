import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  const supabase = createServiceRoleClient();
  const { data: pools } = await supabase
    .from("pools")
    .select("id, slug, title, status, destination_city, container_type")
    .order("created_at", { ascending: false });

  const { data: stats } = await supabase.from("pool_stats").select("pool_id, total_ft3, pledge_count, pct_full");

  const statsByPool = (stats ?? []).reduce(
    (acc, s) => {
      acc[s.pool_id] = s;
      return acc;
    },
    {} as Record<string, { total_ft3: number; pledge_count: number; pct_full: number }>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Pools</h1>
        <Link
          href="/admin/pools/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          New pool
        </Link>
      </div>
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Destination</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">ft³</th>
              <th className="px-4 py-3 text-right font-medium">Pledges</th>
              <th className="px-4 py-3 text-right font-medium">%</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(pools ?? []).map((pool) => {
              const s = statsByPool[pool.id];
              return (
                <tr key={pool.id} className="border-b border-zinc-100">
                  <td className="px-4 py-3 font-medium">{pool.title}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    {pool.destination_city} · {pool.container_type}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        pool.status === "collecting"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {pool.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {s ? Number(s.total_ft3).toFixed(0) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {s?.pledge_count ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {s ? `${Number(s.pct_full).toFixed(0)}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/pools/${pool.id}`}
                      className="text-emerald-600 hover:underline"
                    >
                      Pledges
                    </Link>
                    {" · "}
                    <Link
                      href={`/admin/pools/${pool.id}/edit`}
                      className="text-zinc-600 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!pools || pools.length === 0) && (
          <p className="px-4 py-8 text-center text-zinc-500">No pools yet.</p>
        )}
      </div>
    </div>
  );
}
