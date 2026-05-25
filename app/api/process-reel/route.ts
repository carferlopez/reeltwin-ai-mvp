import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const allowedVideoTypes = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm"
]);

// Validation Schema for POST
const processReelSchema = z.object({
  email: z.string().email("El email proporcionado no es válido."),
  order_reference: z.string().min(1, "La referencia del pedido es requerida."),
  style: z.enum(["nordic-noir", "indie-sundance"], {
    errorMap: () => ({ message: "El estilo cinematográfico seleccionado no es válido." })
  }),
  script: z.string().min(10, "El guion debe tener al menos 10 caracteres.").max(1200, "El guion no puede superar los 1200 caracteres.")
});

// GET /api/process-reel?order_reference=XXX
// Validates payment status and retrieves user email
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderReference = searchParams.get("order_reference");

  if (!orderReference) {
    return NextResponse.json(
      { valid: false, error: "Referencia de pedido no proporcionada." },
      { status: 400 }
    );
  }

  try {
    const supabase = createSupabaseAdmin();
    
    // Verify that the order exists and is paid in the database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("customer_email, payment_status")
      .eq("stripe_session_id", orderReference)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { valid: false, error: "Referencia de pedido inválida o no registrada." },
        { status: 404 }
      );
    }

    if (order.payment_status !== "paid") {
      return NextResponse.json(
        { valid: false, error: "El pago de este pedido aún está pendiente de confirmación." },
        { status: 400 }
      );
    }

    // Check if an intake already exists for this order reference to avoid duplicates
    const { data: existingIntake } = await supabase
      .from("intakes")
      .select("id")
      .eq("order_reference", orderReference)
      .maybeSingle();

    if (existingIntake) {
      return NextResponse.json(
        { valid: false, error: "Ya se ha enviado el material de producción para este pedido." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: order.customer_email
    });
  } catch (error) {
    return NextResponse.json(
      { valid: false, error: "Error de servidor al validar el pedido." },
      { status: 500 }
    );
  }
}

// POST /api/process-reel
// Processes material upload and creates database entries
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const parsed = processReelSchema.safeParse({
      email: formData.get("email"),
      order_reference: formData.get("order_reference"),
      style: formData.get("style"),
      script: formData.get("script")
    });

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Datos del formulario inválidos.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const video = formData.get("training_video");
    if (!(video instanceof File) || !allowedVideoTypes.has(video.type)) {
      return NextResponse.json(
        { error: "Formato de vídeo no soportado (debe ser MP4, MOV o WebM)." },
        { status: 400 }
      );
    }

    // 250 MB size limit validation on server side
    if (video.size > 250 * 1024 * 1024) {
      return NextResponse.json(
        { error: "El archivo de vídeo supera el límite permitido de 250 MB." },
        { status: 413 }
      );
    }

    const supabase = createSupabaseAdmin();

    // 1. Strict server-side security validation against Supabase orders table
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("customer_email, payment_status")
      .eq("stripe_session_id", parsed.data.order_reference)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "La referencia de pago no coincide con ningún pedido registrado." },
        { status: 400 }
      );
    }

    if (order.payment_status !== "paid") {
      return NextResponse.json(
        { error: "No se puede procesar el material de un pedido pendiente de pago." },
        { status: 400 }
      );
    }

    // 2. Prevent duplicate entries
    const { data: existingIntake } = await supabase
      .from("intakes")
      .select("id")
      .eq("order_reference", parsed.data.order_reference)
      .maybeSingle();

    if (existingIntake) {
      return NextResponse.json(
        { error: "El material de producción para este pedido ya ha sido cargado anteriormente." },
        { status: 400 }
      );
    }

    // 3. Upload File to Supabase Storage Buckets
    const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "training-videos";
    const extension = video.name.split(".").pop()?.toLowerCase() ?? "mp4";
    const storagePath = `${parsed.data.order_reference}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, video, {
        contentType: video.type,
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "Fallo al subir el vídeo de entrenamiento al almacenamiento seguro." },
        { status: 500 }
      );
    }

    // 4. Save intake data into public.intakes (with custom style column)
    const { error: writeError } = await supabase.from("intakes").insert({
      order_reference: parsed.data.order_reference,
      customer_email: parsed.data.email,
      style: parsed.data.style,
      script: parsed.data.script,
      training_video_path: storagePath,
      training_video_bucket: bucket,
      status: "received"
    });

    if (writeError) {
      // Clean up uploaded file if database entry fails
      await supabase.storage.from(bucket).remove([storagePath]);
      return NextResponse.json(
        { error: "Fallo al registrar los datos de producción en la base de datos." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      redirectUrl: "/intake/success"
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor al procesar el reel." },
      { status: 500 }
    );
  }
}
