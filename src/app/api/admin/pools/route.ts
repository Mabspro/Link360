import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const supabaseAuth = await createClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    slug,
    title,
    destination_city,
    container_type,
    usable_ft3,
    announce_threshold_pct,
    status,
    is_public,
  } = body;

  if (!slug || !title) {
    return NextResponse.json({ error: "slug and title required" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("pools")
    .insert({
      slug: String(slug).trim(),
      title: String(title).trim(),
      destination_city: destination_city ?? "Lusaka",
      container_type: container_type ?? "20ft",
      usable_ft3: Number(usable_ft3),
      announce_threshold_pct: Number(announce_threshold_pct) ?? 75,
      status: status ?? "collecting",
      is_public: Boolean(is_public),
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id: data?.id });
}
