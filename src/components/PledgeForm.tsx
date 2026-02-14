"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pledgeFormSchema, type PledgeFormValues } from "@/lib/validations";
import { STANDARD_BOXES, ESTIMATE_FT3, in3ToFt3, ft3ToIn3 } from "@/lib/constants";
import { estShippingCost, estPickupFee } from "@/lib/pricing";
import type { PricingConfig } from "./SpacePriceCalculator";
function computeIn3(values: PledgeFormValues): number {
  const qty = values.quantity ?? 1;
  if (values.item_mode === "standard_box" && values.standard_box_code) {
    const box = STANDARD_BOXES[values.standard_box_code as keyof typeof STANDARD_BOXES];
    if (box) return box.length * box.width * box.height * qty;
  }
  if (values.item_mode === "custom_dims") {
    const l = values.length_in ?? 0;
    const w = values.width_in ?? 0;
    const h = values.height_in ?? 0;
    return l * w * h * qty;
  }
  if (values.item_mode === "estimate" && values.estimate_category) {
    const ft3 = ESTIMATE_FT3[values.estimate_category] ?? 2;
    return ft3ToIn3(ft3) * qty;
  }
  return 0;
}

interface PledgeFormProps {
  poolId: string;
  poolSlug: string;
  poolTitle: string;
  onSuccess?: () => void;
  pricing?: PricingConfig | null;
}

export function PledgeForm({ poolId, poolTitle, onSuccess, pricing }: PledgeFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [packingFile, setPackingFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PledgeFormValues>({
    resolver: zodResolver(pledgeFormSchema) as Resolver<PledgeFormValues>,
    defaultValues: {
      pickup_zone: "in_city",
      item_mode: "standard_box",
      quantity: 1,
    },
  });

  const itemMode = watch("item_mode");
  const pickupZone = watch("pickup_zone");
  const quantity = watch("quantity");
  const values = watch();

  const in3Val = computeIn3(values);
  const ft3Val = in3ToFt3(in3Val);
  const estShipping = estShippingCost(in3Val, pricing ?? undefined);
  const estPickup = estPickupFee(pickupZone ?? "in_city", quantity ?? 1, pricing ?? undefined);

  useEffect(() => {
    if (itemMode === "estimate" && !values.estimate_category) setValue("estimate_category", "medium");
  }, [itemMode, setValue, values.estimate_category]);

  async function onSubmit(data: PledgeFormValues) {
    setError("root", { message: "" });
    const in3Final = computeIn3(data);
    const ft3Final = in3ToFt3(in3Final);
    const shippingFinal = estShippingCost(in3Final, pricing ?? undefined);
    const pickupFinal = estPickupFee(data.pickup_zone, data.quantity, pricing ?? undefined);

    if (packingFile && packingFile.size > 0) {
      const formData = new FormData();
      formData.set("file", packingFile);
      formData.set("pool_id", poolId);
      formData.set("user_email", data.user_email);
      const intakeRes = await fetch("/api/intake", {
        method: "POST",
        body: formData,
      });
      if (!intakeRes.ok) {
        const j = await intakeRes.json().catch(() => ({}));
        setError("root", { message: j.error ?? "Upload failed. You can submit without the file." });
        return;
      }
    }

    const res = await fetch("/api/pledges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pool_id: poolId,
        user_email: data.user_email,
        user_name: data.user_name,
        user_phone: data.user_phone || null,
        pickup_zone: data.pickup_zone,
        pickup_city: data.pickup_city || null,
        item_mode: data.item_mode,
        standard_box_code: data.item_mode === "standard_box" ? data.standard_box_code : null,
        length_in: data.item_mode === "custom_dims" ? data.length_in : null,
        width_in: data.item_mode === "custom_dims" ? data.width_in : null,
        height_in: data.item_mode === "custom_dims" ? data.height_in : null,
        quantity: data.quantity,
        computed_in3: in3Final,
        computed_ft3: ft3Final,
        est_shipping_cost: shippingFinal,
        est_pickup_fee: pickupFinal,
        is_internal_cargo: false,
        notes: data.notes || null,
      }),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError("root", { message: j.error ?? "Failed to submit pledge" });
      return;
    }
    setSubmitted(true);
    onSuccess?.();
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="font-medium text-emerald-800">Thank you!</p>
        <p className="mt-1 text-sm text-emerald-700">
          We’ve received your pledge for {poolTitle}. Check your email for confirmation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errors.root?.message && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {errors.root.message}
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Email *</label>
        <input
          type="email"
          {...register("user_email")}
          className="input"
        />
        {errors.user_email && (
          <p className="mt-1 text-sm text-red-600">{errors.user_email.message}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Name *</label>
        <input
          type="text"
          {...register("user_name")}
          className="input"
        />
        {errors.user_name && (
          <p className="mt-1 text-sm text-red-600">{errors.user_name.message}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Phone</label>
        <input
          type="tel"
          {...register("user_phone")}
          className="input"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Pickup</label>
        <select
          {...register("pickup_zone")}
          className="input"
        >
          <option value="in_city">In city ($25)</option>
          <option value="out_of_city">Out of city ($25 + $15/box)</option>
        </select>
        {pickupZone === "out_of_city" && (
          <input
            type="text"
            placeholder="City/area"
            {...register("pickup_city")}
            className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Item</label>
        <select
          {...register("item_mode")}
          className="input"
        >
          <option value="standard_box">Standard box (S / M / L / TV)</option>
          <option value="custom_dims">Custom dimensions</option>
          <option value="estimate">Rough estimate</option>
        </select>
      </div>

      {itemMode === "standard_box" && (
        <div>
          <label className="mb-1 block text-sm text-zinc-600">Box size</label>
          <select
            {...register("standard_box_code")}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          >
            <option value="">Select</option>
            {Object.entries(STANDARD_BOXES).map(([code, dim]) => (
              <option key={code} value={code}>
                {code}: {dim.length}×{dim.width}×{dim.height} in
              </option>
            ))}
          </select>
          {errors.standard_box_code && (
            <p className="mt-1 text-sm text-red-600">{errors.standard_box_code.message}</p>
          )}
        </div>
      )}

      {itemMode === "custom_dims" && (
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="mb-1 block text-xs text-zinc-600">L (in)</label>
            <input type="number" step="0.5" min="0" {...register("length_in")} className="w-full rounded border px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-600">W (in)</label>
            <input type="number" step="0.5" min="0" {...register("width_in")} className="w-full rounded border px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-600">H (in)</label>
            <input type="number" step="0.5" min="0" {...register("height_in")} className="w-full rounded border px-2 py-1.5 text-sm" />
          </div>
          {errors.length_in && (
            <p className="col-span-3 text-sm text-red-600">{errors.length_in.message}</p>
          )}
        </div>
      )}

      {itemMode === "estimate" && (
        <div>
          <label className="mb-1 block text-sm text-zinc-600">Size</label>
          <select {...register("estimate_category")} className="w-full rounded-lg border border-zinc-300 px-3 py-2">
            <option value="small">Small (~2 ft³)</option>
            <option value="medium">Medium (~4 ft³)</option>
            <option value="large">Large (~8 ft³)</option>
          </select>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm text-zinc-600">Quantity</label>
        <input
          type="number"
          min={1}
          {...register("quantity")}
          className="w-24 rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>

      <div className="rounded-lg bg-zinc-100 p-3 text-sm">
        <p><strong>Volume:</strong> {ft3Val.toFixed(2)} ft³</p>
        <p><strong>Est. shipping:</strong> ${estShipping.toFixed(2)}</p>
        <p><strong>Est. pickup:</strong> ${estPickup.toFixed(2)}</p>
        <p><strong>Total (est.):</strong> ${(estShipping + estPickup).toFixed(2)}</p>
      </div>

      <div>
        <label className="mb-1 block text-sm text-zinc-600">Notes</label>
        <textarea {...register("notes")} rows={2} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
      </div>

      <div>
        <label htmlFor="pledge-packing-file" className="mb-1 block text-sm font-medium text-zinc-700">
          Packing list (optional)
        </label>
        <p className="mb-2 text-xs text-zinc-500">
          Optional: Upload a packing list to help us review your shipment. PDF, CSV, Excel, or image. Max 10MB.
        </p>
        <input
          id="pledge-packing-file"
          type="file"
          accept=".pdf,.csv,.xlsx,.xls,image/*"
          className="w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-ocean file:px-4 file:py-2 file:text-sm file:font-medium file:text-white file:hover:bg-ocean-700"
          onChange={(e) => setPackingFile(e.target.files?.[0] ?? null)}
          aria-label="Upload packing list (optional)"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full py-3 disabled:opacity-50"
      >
        {isSubmitting ? "Submitting…" : "Submit pledge"}
      </button>
    </form>
  );
}
