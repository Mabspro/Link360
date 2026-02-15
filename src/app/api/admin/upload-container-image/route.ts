import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin-auth";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  const supabaseAuth = await createClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const poolId = formData.get("pool_id") as string | null;

  if (!file || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Image file required" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
  }

  const mime = file.type?.toLowerCase() ?? "";
  if (!mime.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files allowed" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // Ensure bucket exists (idempotent)
  const bucket = "container-images";
  await supabase.storage.createBucket(bucket, { public: true, fileSizeLimit: "5MB" }).catch(() => {});

  const ext = file.name.split(".").pop()?.slice(0, 10) ?? "jpg";
  const safeExt = /^[a-z0-9]+$/i.test(ext) ? ext : "jpg";
  const folder = poolId || "general";
  const path = `${folder}/${crypto.randomUUID()}.${safeExt}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, arrayBuffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    console.error("[Link360] Container image upload error:", uploadError);
    return NextResponse.json({ error: uploadError.message || "Upload failed" }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);

  return NextResponse.json({ url: publicUrlData.publicUrl });
}
