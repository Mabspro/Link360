import Link from "next/link";
import type { PoolStats } from "@/lib/types";
import { Thermometer } from "./Thermometer";

interface PoolCardProps {
  pool: PoolStats;
}

export function PoolCard({ pool }: PoolCardProps) {
  const isActive = pool.status === "collecting";
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h2 className="font-semibold text-zinc-900">{pool.title}</h2>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            pool.status === "collecting"
              ? "bg-emerald-100 text-emerald-800"
              : pool.status === "announced"
                ? "bg-amber-100 text-amber-800"
                : "bg-zinc-100 text-zinc-600"
          }`}
        >
          {pool.status}
        </span>
      </div>
      <p className="mb-4 text-sm text-zinc-600">
        {pool.destination_city} · {pool.container_type}
      </p>
      <Thermometer stats={pool} />
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-500">
        <span>{Number(pool.total_ft3).toFixed(0)} ft³ pledged</span>
        <span>{pool.pledge_count} pledges</span>
        <span>Est. revenue ${Number(pool.est_revenue).toFixed(0)}</span>
      </div>
      {isActive && (
        <Link
          href={`/pool/${pool.slug}`}
          className="mt-4 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Pledge interest
        </Link>
      )}
    </article>
  );
}
