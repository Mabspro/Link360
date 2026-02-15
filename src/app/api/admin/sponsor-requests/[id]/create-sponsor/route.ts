import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin-auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabaseAuth = await createClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: requestId } = await params;
  if (!requestId) {
    return NextResponse.json({ error: "Request ID required" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data: req, error: fetchError } = await supabase
    .from("sponsor_requests")
    .select("id, name, email, phone, company, status")
    .eq("id", requestId)
    .single();

  if (fetchError || !req) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }
  if (req.status !== "pending") {
    return NextResponse.json({ error: "Request already processed" }, { status: 400 });
  }

  const { data: sponsor, error: insertError } = await supabase
    .from("sponsors")
    .insert({
      name: req.name.trim(),
      email: req.email.trim().toLowerCase(),
      phone: req.phone?.trim() || null,
      company: req.company?.trim() || null,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("[Link360] create-sponsor insert error:", insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("sponsor_requests")
    .update({
      status: "created",
      created_sponsor_id: sponsor.id,
    })
    .eq("id", requestId);

  if (updateError) {
    console.error("[Link360] create-sponsor update request error:", updateError);
    return NextResponse.json({ error: "Sponsor created but request update failed" }, { status: 500 });
  }

  return NextResponse.json({ sponsor_id: sponsor.id });
}
