import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin-auth";

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

  const body = await request.json();
  const {
    title,
    destination_city,
    container_type,
    usable_ft3,
    announce_threshold_pct,
    status,
    is_public,
  } = body;

  const supabase = createServiceRoleClient();
  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = String(title).trim();
  if (destination_city !== undefined) updates.destination_city = destination_city;
  if (container_type !== undefined) updates.container_type = container_type;
  if (usable_ft3 !== undefined) updates.usable_ft3 = Number(usable_ft3);
  if (announce_threshold_pct !== undefined) updates.announce_threshold_pct = Number(announce_threshold_pct);
  if (status !== undefined) updates.status = status;
  if (is_public !== undefined) updates.is_public = Boolean(is_public);

  const { error } = await supabase.from("pools").update(updates).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
