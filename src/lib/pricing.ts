import {
  DEFAULT_RATE_PER_IN3,
  DEFAULT_IN_CITY_STOP_FEE,
  DEFAULT_OUT_OF_CITY_BASE_FEE,
  DEFAULT_OUT_OF_CITY_PER_BOX_FEE,
} from "./constants";
import type { AdminSettings } from "./types";
import type { PickupZone } from "./types";

export function estShippingCost(
  in3: number,
  settings?: Pick<AdminSettings, "rate_per_in3"> | null
): number {
  const rate = settings?.rate_per_in3 ?? DEFAULT_RATE_PER_IN3;
  return Math.round(in3 * rate * 100) / 100;
}

export function estPickupFee(
  pickupZone: PickupZone,
  quantity: number,
  settings?: Pick<
    AdminSettings,
    "in_city_stop_fee" | "out_of_city_base_fee" | "out_of_city_per_box_fee"
  > | null
): number {
  const inCity = settings?.in_city_stop_fee ?? DEFAULT_IN_CITY_STOP_FEE;
  const outBase = settings?.out_of_city_base_fee ?? DEFAULT_OUT_OF_CITY_BASE_FEE;
  const outPerBox =
    settings?.out_of_city_per_box_fee ?? DEFAULT_OUT_OF_CITY_PER_BOX_FEE;

  if (pickupZone === "in_city") return inCity;
  return outBase + outPerBox * quantity;
}
