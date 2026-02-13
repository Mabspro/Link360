"use client";

import type { PoolStats } from "@/lib/types";

interface ThermometerProps {
  stats: PoolStats;
  showInternal?: boolean;
}

export function Thermometer({ stats, showInternal = false }: ThermometerProps) {
  const pct = Math.min(100, Number(stats.pct_full));
  const threshold = stats.announce_threshold_pct ?? 75;
  const atThreshold = pct >= threshold;

  return (
    <div className="w-full max-w-md space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-600">Container fill</span>
        <span className="font-medium tabular-nums">{pct.toFixed(1)}%</span>
      </div>
      <div
        className="h-8 w-full overflow-hidden rounded-full bg-zinc-200"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Container ${pct.toFixed(0)}% full`}
      >
        <div
          className="h-full rounded-full bg-emerald-600 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="relative h-1 w-full">
        <div
          className="absolute top-0 h-3 w-0.5 -translate-x-px bg-amber-500"
          style={{ left: `${threshold}%` }}
          title={`Announce threshold ${threshold}%`}
        />
      </div>
      <p className="text-xs text-zinc-500">
        Threshold to announce: {threshold}%
        {atThreshold && (
          <span className="ml-1 font-medium text-amber-600"> (reached)</span>
        )}
      </p>
      {showInternal && Number(stats.total_internal_ft3) > 0 && (
        <p className="text-xs text-zinc-500">
          Internal cargo: {Number(stats.total_internal_ft3).toFixed(1)} ft³
        </p>
      )}
    </div>
  );
}
