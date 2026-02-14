export type DestinationCity = "Lusaka" | "Ndola";
export type ContainerType = "20ft" | "40ft";
export type PoolStatus = "collecting" | "announced" | "closed";
export type PickupZone = "in_city" | "out_of_city";
export type ItemMode = "standard_box" | "custom_dims" | "estimate";
export type PledgeStatus = "pledged" | "confirmed" | "withdrawn" | "shipped";

export interface Sponsor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  created_at: string;
}

export interface Pool {
  id: string;
  slug: string;
  title: string;
  destination_city: DestinationCity;
  container_type: ContainerType;
  usable_ft3: number;
  announce_threshold_pct: number;
  status: PoolStatus;
  is_public: boolean;
  ships_at: string | null;
  target_ship_cost: number | null;
  sponsor_id: string | null;
  created_at: string;
}

export interface PoolStats {
  pool_id: string;
  slug: string;
  title: string;
  destination_city: DestinationCity;
  container_type: ContainerType;
  usable_ft3: number;
  announce_threshold_pct: number;
  status: PoolStatus;
  is_public?: boolean;
  ships_at: string | null;
  sponsor_id: string | null;
  sponsor_name: string | null;
  sponsor_company: string | null;
  total_ft3: number;
  total_internal_ft3: number;
  total_paid_ft3: number;
  est_revenue: number;
  target_ship_cost: number | null;
  ship_cost_reach_pct: number | null;
  pledge_count: number;
  pct_full: number;
}

export interface PoolUpdate {
  id: string;
  pool_id: string;
  kind: "update" | "announcement" | "loading" | "shipped" | "tracking";
  title: string | null;
  body: string | null;
  created_at: string;
}

export interface Pledge {
  id: string;
  pool_id: string;
  user_email: string;
  user_name: string;
  user_phone: string | null;
  pickup_zone: PickupZone;
  pickup_city: string | null;
  item_mode: ItemMode;
  standard_box_code: string | null;
  length_in: number | null;
  width_in: number | null;
  height_in: number | null;
  quantity: number;
  computed_in3: number;
  computed_ft3: number;
  est_shipping_cost: number;
  est_pickup_fee: number;
  is_internal_cargo: boolean;
  notes: string | null;
  status: PledgeStatus;
  created_at: string;
}

export interface AdminSettings {
  id: number;
  rate_per_in3: number;
  in_city_stop_fee: number;
  out_of_city_base_fee: number;
  out_of_city_per_box_fee: number;
}
