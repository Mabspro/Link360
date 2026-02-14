import { createClient } from "@/lib/supabase/server";
import type { AdminSettings } from "@/lib/types";

/**
 * Fetches the single admin_settings row (pricing config). Safe to call from server components.
 * Returns null if missing; consumers should fall back to DEFAULT_* constants.
 */
export async function getAdminSettings(): Promise<AdminSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_settings")
    .select("id, rate_per_in3, in_city_stop_fee, out_of_city_base_fee, out_of_city_per_box_fee")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: Number(data.id),
    rate_per_in3: Number(data.rate_per_in3),
    in_city_stop_fee: Number(data.in_city_stop_fee),
    out_of_city_base_fee: Number(data.out_of_city_base_fee),
    out_of_city_per_box_fee: Number(data.out_of_city_per_box_fee),
  };
}
