import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { PoolStats } from "@/lib/types";
import { Thermometer } from "@/components/Thermometer";
import { PledgeForm } from "@/components/PledgeForm";
import { PROHIBITED_ITEMS } from "@/lib/faq";

export default async function PoolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let stats: PoolStats | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("pool_stats")
      .select("*")
      .eq("slug", slug)
      .single();
    stats = data;
  } catch (e) {
    console.error("[Link360] Pool page Supabase error:", e);
    notFound();
  }

  if (!stats) notFound();

  const isCollecting = stats.status === "collecting";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Back to pools
      </Link>

      <header className="mt-4 mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
          {stats.title}
        </h1>
        <p className="mt-1 text-zinc-600">
          {stats.destination_city} · {stats.container_type} container
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900">
            Container progress
          </h2>
          <Thermometer stats={stats} showInternal />
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <dt className="text-zinc-500">Total pledged</dt>
            <dd className="font-medium tabular-nums">
              {Number(stats.total_ft3).toFixed(1)} ft³
            </dd>
            <dt className="text-zinc-500">Usable volume</dt>
            <dd className="font-medium tabular-nums">{stats.usable_ft3} ft³</dd>
            <dt className="text-zinc-500">Est. revenue</dt>
            <dd className="font-medium tabular-nums">
              ${Number(stats.est_revenue).toFixed(0)}
            </dd>
            <dt className="text-zinc-500">Pledges</dt>
            <dd className="font-medium tabular-nums">{stats.pledge_count}</dd>
          </dl>
        </div>

        <div>
          {isCollecting ? (
            <>
              <h2 className="mb-3 text-lg font-semibold text-zinc-900">
                Pledge your interest
              </h2>
              <p className="mb-4 text-sm text-zinc-600">
                No payment now. We’ll contact you when the container is confirmed.
              </p>
              <PledgeForm
                poolId={stats.pool_id}
                poolSlug={stats.slug}
                poolTitle={stats.title}
              />
            </>
          ) : (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-center text-zinc-600">
              This pool is no longer accepting pledges.
            </div>
          )}
        </div>
      </div>

      <section className="mt-12 border-t border-zinc-200 pt-8">
        <h2 className="mb-2 text-lg font-semibold text-zinc-900">Prohibited items</h2>
        <p className="mb-2 text-sm text-zinc-600">
          Do not ship: {PROHIBITED_ITEMS}.
        </p>
        <Link href="/faq" className="text-sm text-emerald-600 hover:underline">
          Full FAQ and rules →
        </Link>
      </section>
    </div>
  );
}
