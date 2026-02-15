import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAdminSettings } from "@/lib/get-admin-settings";
import type { PoolStats } from "@/lib/types";
import { HorizontalThermometer } from "@/components/AnimatedThermometer";
import { CollapsibleCalculator } from "@/components/CollapsibleCalculator";
import { PoolPagePledgeGuide } from "@/components/PoolPagePledgeGuide";
import { PoolTrackingUpdates } from "@/components/PoolTrackingUpdates";
import { RouteRealityBlock } from "@/components/RouteRealityBlock";
import { PROHIBITED_ITEMS } from "@/lib/faq";
import { SHIPPING_EMOJI, DEFAULT_ORIGIN_LABEL } from "@/lib/constants";
import type { Metadata } from "next";
import { WhatsAppShareButton } from "@/components/WhatsAppShare";
import { ShipWindowCountdown } from "@/components/ShipWindowCountdown";
import { ContainerImageBlock } from "@/components/ContainerImageModal";

export const dynamic = "force-dynamic";

type PoolPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PoolPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("pool_stats").select("title, destination_city").eq("slug", slug).single();
    if (data?.title) {
      return {
        title: data.title,
        description: `Pledge your space for ${data.title}. ${data.destination_city ?? "Zambia"}. Group container shipping from NorCal.`,
      };
    }
  } catch {
    // ignore
  }
  return { title: "Shipping Pool" };
}

export default async function PoolPage({ params }: PoolPageProps) {
  const { slug } = await params;
  let stats: PoolStats | null = null;
  let updates: { id: string; pool_id: string; kind: string; title: string | null; body: string | null; created_at: string }[] = [];
  try {
    const supabase = await createClient();
    const { data: statsData } = await supabase
      .from("pool_stats")
      .select("*")
      .eq("slug", slug)
      .single();
    stats = statsData;
    if (stats?.pool_id) {
      try {
        const { data: updatesData } = await supabase
          .from("pool_updates")
          .select("id, pool_id, kind, title, body, created_at")
          .eq("pool_id", stats.pool_id)
          .order("created_at", { ascending: false });
        updates = (updatesData ?? []) as typeof updates;
      } catch {
        updates = [];
      }
    }
  } catch (e) {
    console.error("[Link360] Pool page Supabase error:", e);
    notFound();
  }

  if (!stats) notFound();

  const pricing = await getAdminSettings();
  const isCollecting = stats.status === "collecting";
  const usableFt3 = Number(stats.usable_ft3);
  const thresholdFt3 = (usableFt3 * Number(stats.announce_threshold_pct)) / 100;
  const shipCostReachPct = stats.ship_cost_reach_pct != null ? Number(stats.ship_cost_reach_pct) : null;
  const estRevenue = Number(stats.est_revenue);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container-wide py-6">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 mb-4"
          >
            ← Back to pools
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>{SHIPPING_EMOJI}</span>
            <span>Active Pool</span>
          </div>
          <h1 className="heading-1 mb-6">{stats.title}</h1>
          <p className="text-body mb-2">
            {stats.origin_region || DEFAULT_ORIGIN_LABEL} → {stats.destination_city} · {stats.container_type} container
          </p>
          {(stats.sponsor_name || stats.sponsor_company) && (
            <p className="text-sm text-gray-500 mb-6">
              Listed by {[stats.sponsor_company, stats.sponsor_name].filter(Boolean).join(" · ")}
            </p>
          )}
          {!(stats.sponsor_name || stats.sponsor_company) && <div className="mb-6" />}
          {stats.ships_at && (
            <div className="mb-4">
              <ShipWindowCountdown shipsAt={stats.ships_at} />
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              value={`${Number(stats.pct_full).toFixed(0)}%`}
              label="Full"
              color="blue"
            />
            <StatCard
              value={Number(stats.total_ft3).toLocaleString()}
              label="ft³ pledged"
              color="green"
            />
            <StatCard
              value={
                shipCostReachPct != null
                  ? `${Math.round(shipCostReachPct)}%`
                  : `$${estRevenue.toLocaleString()}`
              }
              label={
                shipCostReachPct != null
                  ? "Est. ship cost reach"
                  : "Est. revenue"
              }
              color="purple"
            />
            <StatCard
              value={String(stats.pledge_count)}
              label="Pledges"
              color="orange"
            />
          </div>
          <div className="mt-4">
            <WhatsAppShareButton
              poolTitle={stats.title}
              poolSlug={stats.slug}
              pctFull={Number(stats.pct_full)}
              variant="pool"
            />
          </div>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="heading-3 mb-6">Container Progress</h2>
              <HorizontalThermometer
                current={Number(stats.total_ft3)}
                max={usableFt3}
                threshold={thresholdFt3}
                unit="ft³"
              />
            </div>
            {Number(stats.total_internal_ft3) > 0 && (
              <p className="text-sm text-gray-500">
                Internal cargo: {Number(stats.total_internal_ft3).toFixed(1)} ft³
              </p>
            )}
            <div className="card p-6 border-l-4 border-l-amber-400 bg-amber-50/50">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" aria-hidden />
                Prohibited Items
              </h3>
              <p className="text-sm text-gray-600 mb-4">{PROHIBITED_ITEMS}</p>
              <Link href="/faq" className="text-sm text-blue-600 hover:underline">
                Full FAQ and rules →
              </Link>
            </div>
            <RouteRealityBlock />
            <ContainerImageBlock
              imageUrl={stats.container_image_url ?? null}
              poolTitle={stats.title}
            />
          </div>

          <div className="space-y-6">
            {isCollecting ? (
              <PoolPagePledgeGuide
                poolId={stats.pool_id}
                poolSlug={stats.slug}
                poolTitle={stats.title}
                pricing={pricing}
              />
            ) : (
              <div className="card p-8 text-center">
                <p className="text-gray-600">
                  This pool is no longer accepting pledges.
                </p>
              </div>
            )}
            <PoolTrackingUpdates updates={updates} poolTitle={stats.title} />
            <CollapsibleCalculator pricing={pricing} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
    orange: "bg-orange-50 text-orange-700",
  };
  return (
    <div className={`p-4 rounded-xl ${colors[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  );
}
