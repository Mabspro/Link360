import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin-auth";
import { poolApiSchema } from "@/lib/validations";

function isConfigError(message: string): boolean {
  return /invalid api key|invalid_api_key|jwt|service_role/i.test(message);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabaseAuth = await createClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = poolApiSchema.partial().safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues?.[0]?.message ?? "Validation failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const data = parsed.data;
  const updates: Record<string, unknown> = {};

  // Sponsor: create new from new_sponsor, or use sponsor_id (never store "__new__")
  let sponsorId: string | null | undefined = undefined;
  if (data.new_sponsor?.name?.trim() && data.new_sponsor?.email?.trim()) {
    const supabaseCreate = createServiceRoleClient();
    const { data: sponsor } = await supabaseCreate
      .from("sponsors")
      .insert({
        name: data.new_sponsor.name.trim(),
        email: data.new_sponsor.email.trim(),
        company: data.new_sponsor.company?.trim() || null,
      })
      .select("id")
      .single();
    sponsorId = sponsor?.id ?? null;
  } else if (data.sponsor_id !== undefined) {
    const raw = data.sponsor_id?.trim() || "";
    sponsorId = raw === "__new__" || raw === "" ? null : raw;
  }
  if (sponsorId !== undefined) updates.sponsor_id = sponsorId;

  if (data.title !== undefined) updates.title = data.title.trim();
  if (data.destination_city !== undefined) updates.destination_city = data.destination_city;
  if (data.container_type !== undefined) updates.container_type = data.container_type;
  if (data.usable_ft3 !== undefined) updates.usable_ft3 = data.usable_ft3;
  if (data.announce_threshold_pct !== undefined) updates.announce_threshold_pct = data.announce_threshold_pct;
  if (data.status !== undefined) updates.status = data.status;
  if (data.is_public !== undefined) updates.is_public = data.is_public;
  if (data.ships_at !== undefined) updates.ships_at = data.ships_at?.trim() || null;
  if (data.target_ship_cost !== undefined) updates.target_ship_cost = data.target_ship_cost != null && data.target_ship_cost > 0 ? data.target_ship_cost : null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("pools").update(updates).eq("id", id);

    if (error) {
      if (isConfigError(error.message)) {
        return NextResponse.json(
          { error: "Server configuration error. Set SUPABASE_SERVICE_ROLE_KEY in .env.local (Supabase → Settings → API)." },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    if (isConfigError(msg)) {
      return NextResponse.json(
        { error: "Server configuration error. Set SUPABASE_SERVICE_ROLE_KEY in .env.local (Supabase → Settings → API)." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
