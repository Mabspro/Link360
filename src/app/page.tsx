import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PoolCard } from "@/components/PoolCard";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: stats } = await supabase
    .from("pool_stats")
    .select("*")
    .eq("status", "collecting")
    .eq("is_public", true)
    .order("title");

  const pools = stats ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <section className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Link360 Shipping
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
          Pledge your space for container shipping from Northern California to Zambia (Lusaka or Ndola).
          Interest-only—no payment until the container is confirmed.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/pricing"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            How pricing works
          </Link>
          <Link
            href="/faq"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            FAQ & rules
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-xl font-semibold text-zinc-900">Active pools</h2>
        {pools.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-zinc-500">
            No active pools at the moment. Check back soon or contact us.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {pools.map((pool) => (
              <PoolCard key={pool.pool_id} pool={pool} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
