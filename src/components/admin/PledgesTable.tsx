"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Pledge } from "@/lib/types";

const STATUS_OPTIONS = ["pledged", "confirmed", "withdrawn", "shipped"] as const;

interface PledgesTableProps {
  poolId: string;
  pledges: Pledge[];
  statusFilter?: string;
}

export function PledgesTable({ poolId, pledges, statusFilter }: PledgesTableProps) {
  const router = useRouter();

  function exportCsv() {
    const headers = [
      "email",
      "name",
      "phone",
      "pickup_zone",
      "pickup_city",
      "item_mode",
      "quantity",
      "computed_ft3",
      "est_shipping_cost",
      "est_pickup_fee",
      "is_internal_cargo",
      "status",
      "created_at",
    ];
    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = pledges.map((p) =>
      [
        p.user_email,
        p.user_name,
        p.user_phone ?? "",
        p.pickup_zone,
        p.pickup_city ?? "",
        p.item_mode,
        p.quantity,
        p.computed_ft3,
        p.est_shipping_cost,
        p.est_pickup_fee,
        p.is_internal_cargo,
        p.status,
        p.created_at,
      ].map(escape).join(",")
    );
    const csv = [headers.map(escape).join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pledges-${poolId.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function updatePledge(pledgeId: string, field: "status" | "is_internal_cargo", value: string | boolean) {
    const res = await fetch(`/api/admin/pledges/${pledgeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-zinc-700">Filter by status:</span>
        {STATUS_OPTIONS.map((s) => (
          <Link
            key={s}
            href={statusFilter === s ? `/admin/pools/${poolId}` : `/admin/pools/${poolId}?status=${s}`}
            className={`rounded px-2 py-1 text-sm ${
              statusFilter === s ? "bg-zinc-900 text-white" : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
            }`}
          >
            {s}
          </Link>
        ))}
        <button
          type="button"
          onClick={exportCsv}
          className="ml-auto rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-3 py-2 text-left font-medium">Name</th>
              <th className="px-3 py-2 text-left font-medium">Email</th>
              <th className="px-3 py-2 text-right font-medium">ft³</th>
              <th className="px-3 py-2 text-right font-medium">Shipping</th>
              <th className="px-3 py-2 text-right font-medium">Pickup</th>
              <th className="px-3 py-2 text-center font-medium">Internal</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
              <th className="px-3 py-2 text-left font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {pledges.map((p) => (
              <tr key={p.id} className="border-b border-zinc-100">
                <td className="px-3 py-2">{p.user_name}</td>
                <td className="px-3 py-2">{p.user_email}</td>
                <td className="px-3 py-2 text-right tabular-nums">{Number(p.computed_ft3).toFixed(2)}</td>
                <td className="px-3 py-2 text-right tabular-nums">${Number(p.est_shipping_cost).toFixed(2)}</td>
                <td className="px-3 py-2 text-right tabular-nums">${Number(p.est_pickup_fee).toFixed(2)}</td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={p.is_internal_cargo}
                    onChange={(e) => updatePledge(p.id, "is_internal_cargo", e.target.checked)}
                    className="rounded"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={p.status}
                    onChange={(e) => updatePledge(p.id, "status", e.target.value)}
                    className="rounded border border-zinc-300 px-2 py-1 text-xs"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 text-zinc-500">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pledges.length === 0 && (
          <p className="px-4 py-8 text-center text-zinc-500">No pledges match.</p>
        )}
      </div>
    </div>
  );
}
