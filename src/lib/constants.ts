/** Standard box dimensions (L x W x H in inches) */
export const STANDARD_BOXES = {
  S: { length: 18, width: 18, height: 18 },
  M: { length: 24, width: 24, height: 24 },
  L: { length: 24, width: 24, height: 48 },
  TV: { length: 18, width: 18, height: 48 },
} as const;

export type StandardBoxCode = keyof typeof STANDARD_BOXES;

/** Estimate categories → default ft³ (converted to in³ for calc) */
export const ESTIMATE_FT3: Record<string, number> = {
  small: 2,
  medium: 4,
  large: 8,
};

const IN3_PER_FT3 = 1728;

/** Convert ft³ to in³ */
export function ft3ToIn3(ft3: number): number {
  return ft3 * IN3_PER_FT3;
}

/** Convert in³ to ft³ */
export function in3ToFt3(in3: number): number {
  return in3 / IN3_PER_FT3;
}

/** Default pricing (can be overridden by admin_settings) */
export const DEFAULT_RATE_PER_IN3 = 0.0145;
export const DEFAULT_IN_CITY_STOP_FEE = 25;
export const DEFAULT_OUT_OF_CITY_BASE_FEE = 25;
export const DEFAULT_OUT_OF_CITY_PER_BOX_FEE = 15;

/** Container defaults */
export const DEFAULT_20FT_USABLE_FT3 = 1170;
export const DEFAULT_40FT_USABLE_FT3 = 2390;
export const DEFAULT_ANNOUNCE_THRESHOLD_PCT = 75;
