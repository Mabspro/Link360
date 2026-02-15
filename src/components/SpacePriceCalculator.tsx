"use client";

import React, { useId, useMemo, useState } from "react";
import {
  DEFAULT_RATE_PER_IN3,
  DEFAULT_IN_CITY_STOP_FEE,
  DEFAULT_OUT_OF_CITY_BASE_FEE,
  DEFAULT_OUT_OF_CITY_PER_BOX_FEE,
} from "@/lib/constants";
import type { AdminSettings } from "@/lib/types";

type PickupZone = "in_city" | "out_of_city";
type HeavyFeeMode = "flat" | "per_lb_over" | "tiered";

const HEAVY_TIERS = [
  { max: 200, fee: 50 },
  { max: 300, fee: 100 },
  { max: Infinity, fee: 150 },
];

function money(n: number) {
  if (!Number.isFinite(n)) return "$0.00";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export type PricingConfig = Pick<
  AdminSettings,
  "rate_per_in3" | "in_city_stop_fee" | "out_of_city_base_fee" | "out_of_city_per_box_fee"
>;

interface SpacePriceCalculatorProps {
  /** When true, omit card wrapper and title (e.g. inside CollapsibleCalculator). */
  embedded?: boolean;
  /** Pricing from admin_settings; falls back to defaults if null/undefined. */
  pricing?: PricingConfig | null;
}

export function SpacePriceCalculator({ embedded, pricing }: SpacePriceCalculatorProps = {}) {
  const idPrefix = useId();
  const RATE_PER_IN3 = pricing?.rate_per_in3 ?? DEFAULT_RATE_PER_IN3;
  const IN_CITY_STOP_FEE = pricing?.in_city_stop_fee ?? DEFAULT_IN_CITY_STOP_FEE;
  const OUT_CITY_BASE_FEE = pricing?.out_of_city_base_fee ?? DEFAULT_OUT_OF_CITY_BASE_FEE;
  const OUT_CITY_PER_BOX_FEE = pricing?.out_of_city_per_box_fee ?? DEFAULT_OUT_OF_CITY_PER_BOX_FEE;

  const HEAVY_THRESHOLD_LB = 150;
  const HEAVY_FEE_MODE: HeavyFeeMode = "flat";
  const HEAVY_FEE_FLAT = 50;
  const HEAVY_FEE_PER_LB = 0.75;

  const [lengthIn, setLengthIn] = useState<number>(24);
  const [widthIn, setWidthIn] = useState<number>(24);
  const [heightIn, setHeightIn] = useState<number>(48);
  const [qty, setQty] = useState<number>(1);
  const [weightLb, setWeightLb] = useState<number | "">("");
  const [pickupZone, setPickupZone] = useState<PickupZone>("in_city");

  const calc = useMemo(() => {
    const L = Math.max(0, Number(lengthIn) || 0);
    const W = Math.max(0, Number(widthIn) || 0);
    const H = Math.max(0, Number(heightIn) || 0);
    const Q = Math.max(1, Math.floor(Number(qty) || 1));

    const volumeIn3Per = L * W * H;
    const volumeIn3 = volumeIn3Per * Q;
    const volumeFt3 = volumeIn3 / 1728;

    const baseShipping = volumeIn3 * RATE_PER_IN3;

    const pickupFee =
      pickupZone === "in_city"
        ? IN_CITY_STOP_FEE
        : OUT_CITY_BASE_FEE + OUT_CITY_PER_BOX_FEE * Q;

    const w = weightLb === "" ? null : Math.max(0, Number(weightLb) || 0);
    const isHeavy = w !== null && w > HEAVY_THRESHOLD_LB;

    let heavyFee = 0;
    if (isHeavy) {
      if (HEAVY_FEE_MODE === "flat") {
        heavyFee = HEAVY_FEE_FLAT;
      } else if (HEAVY_FEE_MODE === "per_lb_over") {
        heavyFee = (w - HEAVY_THRESHOLD_LB) * HEAVY_FEE_PER_LB;
      } else {
        const tier = HEAVY_TIERS.find((t) => w <= t.max) || HEAVY_TIERS[HEAVY_TIERS.length - 1];
        heavyFee = tier.fee;
      }
    }

    const total = baseShipping + pickupFee + heavyFee;

    return {
      L: L,
      W: W,
      H: H,
      Q: Q,
      volumeIn3,
      volumeFt3,
      baseShipping,
      pickupFee,
      heavyFee,
      total,
      isHeavy,
      weight: w,
    };
  }, [lengthIn, widthIn, heightIn, qty, weightLb, pickupZone, RATE_PER_IN3, IN_CITY_STOP_FEE, OUT_CITY_BASE_FEE, OUT_CITY_PER_BOX_FEE, HEAVY_THRESHOLD_LB, HEAVY_FEE_MODE, HEAVY_FEE_FLAT, HEAVY_FEE_PER_LB]);

  const content = (
    <>
      {!embedded && (
        <>
          <h3 className="heading-4">Space + price calculator</h3>
          <p className="mt-1 text-sm text-gray-600">
            Enter dimensions in inches. We’ll estimate volume and cost. Heavy items over {HEAVY_THRESHOLD_LB} lb add a ${HEAVY_FEE_FLAT} handling fee (final assessed at pickup).
          </p>
        </>
      )}

      <div className={embedded ? "grid grid-cols-3 gap-3" : "mt-4 grid grid-cols-3 gap-3"}>
        <CalcField id={`${idPrefix}-length`} label="Length (in)" value={lengthIn} onChange={(v) => setLengthIn(v === "" ? 0 : Number(v))} />
        <CalcField id={`${idPrefix}-width`} label="Width (in)" value={widthIn} onChange={(v) => setWidthIn(v === "" ? 0 : Number(v))} />
        <CalcField id={`${idPrefix}-height`} label="Height (in)" value={heightIn} onChange={(v) => setHeightIn(v === "" ? 0 : Number(v))} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <CalcField
          id={`${idPrefix}-qty`}
          label="Quantity"
          value={qty}
          onChange={(v) => setQty(v === "" ? 1 : Math.max(1, Math.floor(Number(v) || 1)))}
        />
        <div>
          <label htmlFor={`${idPrefix}-weight`} className="label">Approx weight (lb)</label>
          <input
            id={`${idPrefix}-weight`}
            type="number"
            min={0}
            step={1}
            value={weightLb === "" ? "" : weightLb}
            placeholder="Optional"
            onChange={(e) => setWeightLb(e.target.value === "" ? "" : Number(e.target.value))}
            className="input"
            aria-label="Approx weight (lb)"
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="label">Pickup zone</label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-sm font-medium border-2 transition-colors ${
              pickupZone === "in_city"
                ? "border-ocean bg-ocean text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setPickupZone("in_city")}
          >
            In-city ($25/stop)
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-sm font-medium border-2 transition-colors ${
              pickupZone === "out_of_city"
                ? "border-ocean bg-ocean text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setPickupZone("out_of_city")}
          >
            Out-of-city ($25 + $15/box)
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-gray-50 p-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <CalcLine label="Volume (in³)" value={calc.volumeIn3.toLocaleString()} />
          <CalcLine label="Volume (ft³)" value={calc.volumeFt3.toFixed(2)} />
          <CalcLine label="Base shipping" value={money(calc.baseShipping)} />
          <CalcLine label="Pickup fee" value={money(calc.pickupFee)} />
          <CalcLine
            label={calc.weight != null ? `Heavy handling (>${HEAVY_THRESHOLD_LB} lb)` : "Heavy handling"}
            value={calc.isHeavy ? money(calc.heavyFee) : "—"}
            warn={calc.isHeavy}
          />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3">
          <span className="text-sm font-medium text-gray-700">Estimated total</span>
          <span className="text-xl font-bold text-gray-900">{money(calc.total)}</span>
        </div>

        <p className="mt-2 text-xs text-gray-500">
          Estimate only. Final pricing may adjust after inspection, packing efficiency, and handling.
        </p>
      </div>
    </>
  );

  if (embedded) return <div className="min-w-0">{content}</div>;
  return <div className="card p-5">{content}</div>;
}

function CalcField({
  label,
  value,
  onChange,
  id,
}: {
  label: string;
  value: number;
  onChange: (v: number | "") => void;
  id: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input
        id={id}
        type="number"
        min={0}
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        className="input"
        aria-label={label}
      />
    </div>
  );
}

function CalcLine({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={warn ? "font-medium text-gray-800" : "text-gray-700"}>{label}</span>
      <span className={`tabular-nums ${warn ? "font-semibold text-gray-900" : "text-gray-900"}`}>{value}</span>
    </div>
  );
}
