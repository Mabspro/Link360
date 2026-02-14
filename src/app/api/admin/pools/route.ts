import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin-auth";
import { poolApiSchema } from "@/lib/validations";

function isConfigError(message: string): boolean {
  return /invalid api key|invalid_api_key|jwt|service_role/i.test(message);
}

export async function POST(request: Request) {
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

  const parsed = poolApiSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues?.[0]?.message ?? "Validation failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const data = parsed.data;

  try {
    const supabase = createServiceRoleClient();
    let sponsorId: string | null = data.sponsor_id?.trim() || null;
    if (data.new_sponsor?.name?.trim() && data.new_sponsor?.email?.trim()) {
      const { data: sponsor } = await supabase
        .from("sponsors")
        .insert({
          name: data.new_sponsor.name.trim(),
          email: data.new_sponsor.email.trim(),
          company: data.new_sponsor.company?.trim() || null,
        })
        .select("id")
        .single();
      sponsorId = sponsor?.id ?? null;
    }

    const shipsAt = data.ships_at?.trim() || null;
    const targetShipCost = data.target_ship_cost != null && data.target_ship_cost > 0 ? data.target_ship_cost : null;
    const { data: row, error } = await supabase
      .from("pools")
      .insert({
        slug: data.slug.trim(),
        title: data.title.trim(),
        destination_city: data.destination_city,
        container_type: data.container_type,
        usable_ft3: data.usable_ft3,
        announce_threshold_pct: data.announce_threshold_pct,
        status: data.status,
        is_public: data.is_public,
        ships_at: shipsAt,
        target_ship_cost: targetShipCost,
        sponsor_id: sponsorId,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "A pool with this slug already exists" }, { status: 400 });
      }
      if (isConfigError(error.message)) {
        return NextResponse.json(
          { error: "Server configuration error. Set SUPABASE_SERVICE_ROLE_KEY in .env.local (Supabase → Settings → API)." },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ id: row?.id });
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
