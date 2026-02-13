import { z } from "zod";
import { STANDARD_BOXES } from "./constants";

const standardBoxCodes = Object.keys(STANDARD_BOXES) as [string, ...string[]];

export const pledgeFormSchema = z
  .object({
    user_email: z.string().email("Valid email required"),
    user_name: z.string().min(1, "Name required"),
    user_phone: z.string().optional(),
    pickup_zone: z.enum(["in_city", "out_of_city"]),
    pickup_city: z.string().optional(),
    item_mode: z.enum(["standard_box", "custom_dims", "estimate"]),
    standard_box_code: z.string().optional(),
    length_in: z.coerce.number().min(0).optional(),
    width_in: z.coerce.number().min(0).optional(),
    height_in: z.coerce.number().min(0).optional(),
    quantity: z.coerce.number().int().min(1),
    estimate_category: z.enum(["small", "medium", "large"]).optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.item_mode === "standard_box") {
      if (!data.standard_box_code || !standardBoxCodes.includes(data.standard_box_code)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["standard_box_code"],
          message: "Select a box size",
        });
      }
    }
    if (data.item_mode === "custom_dims") {
      const l = data.length_in ?? 0;
      const w = data.width_in ?? 0;
      const h = data.height_in ?? 0;
      if (l <= 0 || w <= 0 || h <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["length_in"],
          message: "Length, width, and height required",
        });
      }
    }
  });

export type PledgeFormValues = z.infer<typeof pledgeFormSchema>;

export const poolFormSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers, hyphens only"),
  title: z.string().min(1, "Title required"),
  destination_city: z.enum(["Lusaka", "Ndola"]),
  container_type: z.enum(["20ft", "40ft"]),
  usable_ft3: z.coerce.number().positive(),
  announce_threshold_pct: z.coerce.number().min(0).max(100),
  status: z.enum(["collecting", "announced", "closed"]),
  is_public: z.boolean(),
});

export type PoolFormValues = z.infer<typeof poolFormSchema>;

export const pledgeStatusSchema = z.enum(["pledged", "confirmed", "withdrawn", "shipped"]);
