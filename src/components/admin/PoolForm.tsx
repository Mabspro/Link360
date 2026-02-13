"use client";

import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { poolFormSchema, type PoolFormValues } from "@/lib/validations";
import {
  DEFAULT_20FT_USABLE_FT3,
  DEFAULT_40FT_USABLE_FT3,
} from "@/lib/constants";

interface PoolFormProps {
  poolId?: string;
  defaultValues: PoolFormValues;
}

export function PoolForm({ poolId, defaultValues }: PoolFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PoolFormValues>({
    resolver: zodResolver(poolFormSchema) as Resolver<PoolFormValues>,
    defaultValues,
  });

  async function onSubmit(data: PoolFormValues) {
    const url = poolId ? `/api/admin/pools/${poolId}` : "/api/admin/pools";
    const res = await fetch(url, {
      method: poolId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.error ?? "Failed to save");
    }
    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 max-w-md space-y-4">
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
        <label className="mb-1 block text-sm font-medium">Status</label>
        <select {...register("status")} className="w-full rounded-lg border border-zinc-300 px-3 py-2">
          <option value="collecting">collecting</option>
          <option value="announced">announced</option>
          <option value="closed">closed</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" {...register("is_public")} className="rounded" />
        <label className="text-sm">Public (visible on home)</label>
      </div>
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
