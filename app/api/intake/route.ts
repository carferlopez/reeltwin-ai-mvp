import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const intakeSchema = z.object({
  email: z.string().email(),
  order_reference: z.string().max(255).optional(),
  script: z.string().min(10).max(1200)
});

const allowedVideoTypes = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm"
]);

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = intakeSchema.safeParse({
    email: formData.get("email"),
    order_reference: formData.get("order_reference") || undefined,
    script: formData.get("script")
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid intake payload" }, { status: 400 });
  }

  const video = formData.get("training_video");
  if (!(video instanceof File) || !allowedVideoTypes.has(video.type)) {
    return NextResponse.json({ error: "Invalid training video" }, { status: 400 });
  }

  if (video.size > 250 * 1024 * 1024) {
    return NextResponse.json({ error: "Video too large" }, { status: 413 });
  }

  const supabase = createSupabaseAdmin();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "training-videos";
  const orderKey = parsed.data.order_reference || crypto.randomUUID();
  const extension = video.name.split(".").pop()?.toLowerCase() ?? "mp4";
  const storagePath = `${orderKey}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, video, {
      contentType: video.type,
      upsert: false
    });

  if (uploadError) {
    return NextResponse.json({ error: "Video upload failed" }, { status: 500 });
  }

  const { error: writeError } = await supabase.from("intakes").insert({
    order_reference: parsed.data.order_reference,
    customer_email: parsed.data.email,
    script: parsed.data.script,
    training_video_path: storagePath,
    training_video_bucket: bucket,
    status: "received"
  });

  if (writeError) {
    await supabase.storage.from(bucket).remove([storagePath]);
    return NextResponse.json({ error: "Intake write failed" }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/intake/success", request.url), 303);
}
