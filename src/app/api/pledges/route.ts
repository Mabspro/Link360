import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendPledgeConfirmation } from "@/lib/email";
import { sendAdminPledgeNotification } from "@/lib/email";
import { getAdminEmails } from "@/lib/admin-emails";
import { checkPledgeRateLimit } from "@/lib/rate-limit";
import { pledgeApiSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const rate = checkPledgeRateLimit(request);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = pledgeApiSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0];
      const message =
        firstError?.message ?? parsed.error.message ?? "Validation failed";
      return NextResponse.json(
        { error: message },
        { status: 400 }
      );
    }
    const {
      pool_id,
      user_email,
      user_name,
      user_phone,
      pickup_zone,
      pickup_city,
      item_mode,
      standard_box_code,
      length_in,
      width_in,
      height_in,
      quantity,
      computed_in3,
      computed_ft3,
      est_shipping_cost,
      est_pickup_fee,
      is_internal_cargo,
      notes,
    } = parsed.data;

    const supabase = createServiceRoleClient();

    const { data: poolRow } = await supabase
      .from("pools")
      .select("id, status, title")
      .eq("id", pool_id)
      .single();
    if (!poolRow || poolRow.status !== "collecting") {
      return NextResponse.json(
        { error: "This pool is not accepting pledges." },
        { status: 400 }
      );
    }

    const emailNormalized = user_email.trim().toLowerCase();
    const { data: existing } = await supabase
      .from("pledges")
      .select("id")
      .eq("pool_id", pool_id)
      .ilike("user_email", emailNormalized)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          error:
            "You have already submitted a pledge for this pool. Contact us if you need to modify it.",
        },
        { status: 409 }
      );
    }

    const { data: pledge, error } = await supabase
      .from("pledges")
      .insert({
        pool_id,
        user_email: user_email.trim(),
        user_name: user_name.trim(),
        user_phone: (user_phone ?? "").toString().trim() || null,
        pickup_zone,
        pickup_city: (pickup_city ?? "").toString().trim() || null,
        item_mode,
        standard_box_code: standard_box_code ?? null,
        length_in: length_in ?? null,
        width_in: width_in ?? null,
        height_in: height_in ?? null,
        quantity,
        computed_in3,
        computed_ft3,
        est_shipping_cost,
        est_pickup_fee,
        is_internal_cargo: is_internal_cargo ?? false,
        notes: (notes ?? "").toString().trim() || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Pledge insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.info(
      JSON.stringify({
        type: "pledge_created",
        pool_id,
        user_email: user_email.trim().toLowerCase(),
        ft3: Number(computed_ft3),
        pickup_zone,
        timestamp: new Date().toISOString(),
      })
    );

    const poolTitle = poolRow.title ?? "Shipping pool";

    await sendPledgeConfirmation({
      to: user_email,
      userName: user_name,
      poolTitle,
      estShipping: Number(est_shipping_cost),
      estPickup: Number(est_pickup_fee),
      totalFt3: Number(computed_ft3),
    });

    const estRevenue = Number(est_shipping_cost);
    const adminEmails = getAdminEmails(process.env.LINK360_ADMIN_EMAILS);
    if (adminEmails.length > 0) {
      await sendAdminPledgeNotification({
        adminEmails,
        poolTitle,
        userName: user_name,
        userEmail: user_email,
        totalFt3: Number(computed_ft3),
        estRevenue,
      });
    }

    return NextResponse.json({ id: pledge?.id });
  } catch (e) {
    console.error("Pledge API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
