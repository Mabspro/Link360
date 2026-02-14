import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PoolCard } from "@/components/PoolCard";
import { HomeHero } from "@/components/HomeHero";
import { HowItWorks } from "@/components/HowItWorks";
import { EmptyPoolsState } from "@/components/EmptyPoolsState";

async function getPools() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pool_stats")
    .select("*")
    .eq("status", "collecting")
    .eq("is_public", true)
    .order("ships_at", { ascending: true, nullsFirst: false });
  return data ?? [];
}

export default async function HomePage() {
  let pools: Awaited<ReturnType<typeof getPools>> = [];
  try {
    pools = await getPools();
  } catch (e) {
    console.error("[Link360] Home page Supabase error:", e);
  }

  return (
    <div className="min-h-screen">
      <HomeHero />
      <section id="pools" className="section">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="heading-2">Active Shipping Pools</h2>
                <p className="text-body mt-2">Choose a destination and pledge your space</p>
              </div>
              <Link href="/pricing" className="btn-ghost hidden sm:inline-flex">
                Pricing
              </Link>
            </div>
            {pools.length > 0 ? (
              <div className="flex flex-col gap-6">
                {pools.map((pool, index) => (
                  <PoolCard key={pool.pool_id} pool={pool} index={index} />
                ))}
              </div>
            ) : (
              <EmptyPoolsState />
            )}
          </div>
        </div>
      </section>
      <HowItWorks />
    </div>
  );
}
