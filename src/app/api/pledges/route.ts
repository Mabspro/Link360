import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendPledgeConfirmation } from "@/lib/email";
import { sendAdminPledgeNotification } from "@/lib/email";

const ADMIN_EMAILS = (process.env.LINK360_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
    } = body;

    if (!pool_id || !user_email || !user_name || !pickup_zone || !item_mode || quantity == null) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();
    const { data: pledge, error } = await supabase
      .from("pledges")
      .insert({
        pool_id,
        user_email: String(user_email).trim(),
        user_name: String(user_name).trim(),
        user_phone: user_phone ? String(user_phone).trim() : null,
        pickup_zone,
        pickup_city: pickup_city ? String(pickup_city).trim() : null,
        item_mode,
        standard_box_code: standard_box_code || null,
        length_in: length_in != null ? Number(length_in) : null,
        width_in: width_in != null ? Number(width_in) : null,
        height_in: height_in != null ? Number(height_in) : null,
        quantity: Number(quantity) || 1,
        computed_in3: Number(computed_in3),
        computed_ft3: Number(computed_ft3),
        est_shipping_cost: Number(est_shipping_cost),
        est_pickup_fee: Number(est_pickup_fee),
        is_internal_cargo: Boolean(is_internal_cargo),
        notes: notes ? String(notes).trim() : null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Pledge insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: pool } = await supabase
      .from("pools")
      .select("title")
      .eq("id", pool_id)
      .single();

    const poolTitle = pool?.title ?? "Shipping pool";

    await sendPledgeConfirmation({
      to: user_email,
      userName: user_name,
      poolTitle,
      estShipping: Number(est_shipping_cost),
      estPickup: Number(est_pickup_fee),
      totalFt3: Number(computed_ft3),
    });

    const estRevenue = Number(est_shipping_cost);
    if (ADMIN_EMAILS.length > 0) {
      await sendAdminPledgeNotification({
        adminEmails: ADMIN_EMAILS,
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
