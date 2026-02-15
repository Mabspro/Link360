import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminUser } from "@/lib/admin-auth";
import { PoolForm } from "@/components/admin/PoolForm";
import {
  DEFAULT_20FT_USABLE_FT3,
  DEFAULT_ANNOUNCE_THRESHOLD_PCT,
} from "@/lib/constants";

export default async function NewPoolPage() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  return (
    <div>
      <Link href="/admin/dashboard" className="text-sm text-zinc-500 hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900">New pool</h1>
      <PoolForm
        defaultValues={{
          slug: "",
          title: "",
          destination_city: "Lusaka",
          container_type: "20ft",
          usable_ft3: DEFAULT_20FT_USABLE_FT3,
          announce_threshold_pct: DEFAULT_ANNOUNCE_THRESHOLD_PCT,
          status: "collecting",
          is_public: true,
          ships_at: "",
          target_ship_cost: undefined,
          origin_region: "NorCal",
          sponsor_id: "",
          new_sponsor: undefined,
        }}
      />
    </div>
  );
}
