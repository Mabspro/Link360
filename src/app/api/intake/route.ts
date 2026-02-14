import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const intakeFormSchema = z.object({
  pool_id: z.string().uuid(),
  user_email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const pool_id = formData.get("pool_id") as string | null;
    const user_email = formData.get("user_email") as string | null;

    const parsed = intakeFormSchema.safeParse({ pool_id, user_email });
    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message ?? "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "A file is required" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be under 10MB" },
        { status: 400 }
      );
    }

    const mime = file.type?.toLowerCase() ?? "";
    const allowed =
      ALLOWED_TYPES.includes(mime) || mime.startsWith("image/");
    if (!allowed) {
      return NextResponse.json(
        { error: "File type not allowed. Use PDF, CSV, Excel, or image." },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    const { data: poolRow } = await supabase
      .from("pools")
      .select("id")
      .eq("id", parsed.data.pool_id)
      .single();
    if (!poolRow) {
      return NextResponse.json(
        { error: "Invalid pool." },
        { status: 400 }
      );
    }

    const bucket = "intake";
    const { error: bucketError } = await supabase.storage.createBucket(bucket, {
      public: false,
      fileSizeLimit: "10MB",
    });
    if (bucketError && bucketError.message !== "Bucket already exists") {
      console.error("[Link360] Intake bucket create error:", bucketError);
    }

    const ext = file.name.split(".").pop()?.slice(0, 10) ?? "bin";
    const safeExt = /^[a-z0-9]+$/i.test(ext) ? ext : "bin";
    const path = `${parsed.data.pool_id}/${crypto.randomUUID()}.${safeExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, arrayBuffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      console.error("[Link360] Intake upload error:", uploadError);
      return NextResponse.json(
        { error: uploadError.message || "Upload failed" },
        { status: 500 }
      );
    }

    const { data: row, error: insertError } = await supabase
      .from("intake_documents")
      .insert({
        pool_id: parsed.data.pool_id,
        user_email: parsed.data.user_email.trim().toLowerCase(),
        file_path: path,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[Link360] Intake insert error:", insertError);
      return NextResponse.json(
        { error: insertError.message || "Failed to record upload" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id: row?.id });
  } catch (e) {
    console.error("[Link360] Intake API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
