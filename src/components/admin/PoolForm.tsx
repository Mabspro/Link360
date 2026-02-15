"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { poolFormSchema, type PoolFormValues } from "@/lib/validations";
import {
  DEFAULT_20FT_USABLE_FT3,
  DEFAULT_40FT_USABLE_FT3,
  ORIGIN_REGIONS,
} from "@/lib/constants";
import type { Sponsor } from "@/lib/types";

interface PoolFormProps {
  poolId?: string;
  defaultValues: PoolFormValues;
  /** Pass from server on edit so sponsor dropdown shows current value on first paint */
  initialSponsors?: Pick<Sponsor, "id" | "name" | "email" | "company">[];
}

export function PoolForm({ poolId, defaultValues, initialSponsors = [] }: PoolFormProps) {
  const router = useRouter();
  const [sponsors, setSponsors] = useState<Pick<Sponsor, "id" | "name" | "email" | "company">[]>(initialSponsors);
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PoolFormValues>({
    resolver: zodResolver(poolFormSchema) as Resolver<PoolFormValues>,
    defaultValues,
  });

  const sponsorId = watch("sponsor_id");
  const useNewSponsor = sponsorId === "__new__";

  useEffect(() => {
    if (initialSponsors.length > 0) return; // already have from server
    fetch("/api/admin/sponsors", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then(setSponsors)
      .catch(() => setSponsors([]));
  }, [initialSponsors.length]);

  async function onSubmit(data: PoolFormValues) {
    try {
      const payload: Record<string, unknown> = { ...data };
      // Never send new_sponsor unless we're actually adding a new one with valid name/email
      delete payload.new_sponsor;
      if (data.sponsor_id === "__new__") {
        delete payload.sponsor_id;
        if (data.new_sponsor?.name?.trim() && data.new_sponsor?.email?.trim()) {
          payload.new_sponsor = data.new_sponsor;
        } else {
          payload.sponsor_id = null;
        }
      } else if (!data.sponsor_id?.trim()) {
        payload.sponsor_id = null;
      }
      const url = poolId ? `/api/admin/pools/${poolId}` : "/api/admin/pools";
      const res = await fetch(url, {
        method: poolId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = j.error ?? (res.status === 401 ? "Please sign in again" : "Failed to save");
        setError("root", { message: msg });
        toast.error(msg);
        return;
      }
      toast.success(poolId ? "Pool updated." : "Pool created.");
      router.push("/admin/dashboard");
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError("root", { message: msg });
      toast.error(msg);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (err) => {
        const msg = Object.values(err).map((e) => e?.message).filter(Boolean).join(" ") || "Please fix the errors above.";
        setError("root", { message: msg });
        toast.error(msg);
      })}
      className="mt-6 max-w-md space-y-4"
    >
      <div>
        <label className="mb-1 block text-sm font-medium">Slug (URL)</label>
        <input
          {...register("slug")}
          placeholder="norcal-lusaka-march"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          readOnly={!!poolId}
        />
        {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <input
          {...register("title")}
          placeholder="NorCal → Lusaka (March Window)"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Destination</label>
          <select {...register("destination_city")} className="w-full rounded-lg border border-zinc-300 px-3 py-2">
            <option value="Lusaka">Lusaka</option>
            <option value="Ndola">Ndola</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Container</label>
          <select {...register("container_type")} className="w-full rounded-lg border border-zinc-300 px-3 py-2">
            <option value="20ft">20ft</option>
            <option value="40ft">40ft</option>
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Origin region (US)</label>
        <select {...register("origin_region")} className="w-full rounded-lg border border-zinc-300 px-3 py-2">
          <option value="">— Not set —</option>
          {ORIGIN_REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-zinc-500">Staging for regional browsing; sponsors can be nationwide (US)</p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Usable ft³</label>
        <input
          type="number"
          step="1"
          {...register("usable_ft3")}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Defaults: 20ft = {DEFAULT_20FT_USABLE_FT3}, 40ft = {DEFAULT_40FT_USABLE_FT3}
        </p>
        {errors.usable_ft3 && <p className="mt-1 text-sm text-red-600">{errors.usable_ft3.message}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Announce threshold %</label>
        <input
          type="number"
          min={0}
          max={100}
          {...register("announce_threshold_pct")}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Ship window (date)</label>
        <input
          type="date"
          {...register("ships_at")}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
        <p className="mt-1 text-xs text-zinc-500">Used to sort pools by soonest to go on the home page</p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Target ship cost ($)</label>
        <input
          type="number"
          min={0}
          step={1}
          {...register("target_ship_cost")}
          placeholder="Optional"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
        <p className="mt-1 text-xs text-zinc-500">Shows &quot;Est. ship cost reach&quot; % (enables future donate-to-ship / non-profit)</p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Pool sponsor (container owner)</label>
        <select {...register("sponsor_id")} className="w-full rounded-lg border border-zinc-300 px-3 py-2">
          <option value="">— No sponsor —</option>
          {sponsors.map((s) => (
            <option key={s.id} value={s.id}>
              {s.company?.trim() || s.name} {s.company ? `(${s.name})` : ""}
            </option>
          ))}
          <option value="__new__">+ Add new sponsor</option>
        </select>
        <p className="mt-1 text-xs text-zinc-500">Shown as &quot;Listed by …&quot; on the pool</p>
        {useNewSponsor && (
          <div className="mt-3 space-y-2 rounded-lg border border-zinc-200 bg-zinc-50/50 p-3">
            <input
              {...register("new_sponsor.name")}
              placeholder="Sponsor name"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
            <input
              {...register("new_sponsor.email")}
              type="email"
              placeholder="Sponsor email"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
            <input
              {...register("new_sponsor.company")}
              placeholder="Company (optional)"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Status</label>
        <select {...register("status")} className="w-full rounded-lg border border-zinc-300 px-3 py-2">
          <option value="collecting">collecting</option>
          <option value="announced">announced</option>
          <option value="loading">loading</option>
          <option value="shipped">shipped</option>
          <option value="arrived_port">arrived at port</option>
          <option value="arrived_destination">arrived at destination</option>
          <option value="cleared">cleared customs</option>
          <option value="ready_pickup">ready for pickup</option>
          <option value="closed">closed</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" {...register("is_public")} className="rounded" />
        <label className="text-sm">Public (visible on home)</label>
      </div>
      {errors.root?.message && (
        <p className="text-sm text-red-600">{errors.root.message}</p>
      )}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {isSubmitting ? "Saving…" : poolId ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
