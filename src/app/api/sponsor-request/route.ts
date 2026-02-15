import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { checkSponsorRequestRateLimit } from "@/lib/rate-limit";
import { sponsorRequestSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const rate = checkSponsorRequestRateLimit(request);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = sponsorRequestSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues?.[0]?.message ?? "Validation failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { name, email, phone, company, message } = parsed.data;

  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("sponsor_requests").insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      company: company?.trim() || null,
      message: message?.trim() || null,
      status: "pending",
    });

    if (error) {
      console.error("[Link360] sponsor-request insert error:", error);
      return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Link360] sponsor-request error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
