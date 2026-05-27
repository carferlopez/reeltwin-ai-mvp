import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { isMockMode, getMockDb, saveMockDb } from "@/lib/mockDb";
import { log } from "@/lib/logger";
import * as fs from "fs";
import * as path from "path";

export const runtime = "nodejs";

// Validation Schema for JSON POST payload
const processReelSchema = z.object({
  sessionId: z.string().min(1, "El ID de sesión es obligatorio."),
  selectedStyle: z.enum(["nordic-noir", "indie-sundance"], {
    errorMap: () => ({ message: "El estilo cinematográfico seleccionado no es válido." })
  }),
  videoUrl: z.string().url("La URL del vídeo no es válida."),
  scriptText: z.string().min(10, "El guion debe tener al menos 10 caracteres.").max(500, "El guion no puede superar los 500 caracteres."),
  liability_accepted: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar expresamente la responsabilidad legal sobre el uso de la imagen de los performers." })
  })
});

// GET /api/process-reel?order_reference=XXX[&action=get-upload-url][&filename=video.mp4]
// Validates payment status, retrieves email, and optionally issues signed upload URLs
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderReference = searchParams.get("order_reference");

  if (!orderReference) {
    return NextResponse.json(
      { valid: false, error: "Referencia de pedido no proporcionada." },
      { status: 400 }
    );
  }

  // --- MOCK MODE FALLBACK ---
  if (isMockMode()) {
    log("order_validation_started", { order_reference: orderReference, mode: "mock" });
    const db = getMockDb();
    const order = db.orders[orderReference];

    if (!order) {
      return NextResponse.json(
        { valid: false, error: "La referencia de pago no es válida o está pendiente de confirmación." },
        { status: 404 }
      );
    }

    if (order.payment_status !== "paid") {
      return NextResponse.json(
        { valid: false, error: "El pago de este pedido aún está pendiente de confirmación." },
        { status: 400 }
      );
    }

    // Check for duplicates
    if (order.status === "completed" || db.intakes[orderReference]) {
      return NextResponse.json(
        { valid: false, error: "Ya se ha enviado el material de producción para este pedido." },
        { status: 400 }
      );
    }

    const action = searchParams.get("action");
    if (action === "get-upload-url") {
      // Direct mock upload to our local PUT endpoint!
      const uploadUrl = `${new URL(request.url).origin}/api/process-reel?action=mock-upload&order_reference=${orderReference}`;
      const videoUrl = `${new URL(request.url).origin}/mock-storage/raw-videos/${orderReference}/video.mp4`;

      return NextResponse.json({
        valid: true,
        email: order.customer_email,
        uploadUrl: uploadUrl,
        videoUrl: videoUrl
      });
    }

    return NextResponse.json({
      valid: true,
      email: order.customer_email
    });
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

    // Proxy-upload pattern to completely bypass browser CORS limitations and guarantee H.264 video uploads
    const action = searchParams.get("action");
    if (action === "get-upload-url") {
      const uploadUrl = `${new URL(request.url).origin}/api/process-reel?action=mock-upload&order_reference=${orderReference}`;
      const storagePath = `${orderReference}/video.mp4`;

      // Generate the public URL that will be populated in Supabase Storage
      const { data: { publicUrl } } = supabase.storage
        .from("raw-videos")
        .getPublicUrl(storagePath);

      return NextResponse.json({
        valid: true,
        email: order.customer_email,
        uploadUrl: uploadUrl,
        videoUrl: publicUrl
      });
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
// Receives JSON metadata, updates order status, processes Cinematic Franchise, and creates intake
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate JSON input
    const parsed = processReelSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Datos JSON inválidos.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { sessionId, selectedStyle, videoUrl, scriptText } = parsed.data;

    // --- MOCK MODE FALLBACK ---
    if (isMockMode()) {
      log("metadata_processing_started", { order_reference: sessionId, mode: "mock" });
      
      const db = getMockDb();
      const order = db.orders[sessionId];

      if (!order) {
        return NextResponse.json({ error: "Pedido no encontrado." }, { status: 400 });
      }

      // Update mock order state
      db.orders[sessionId].status = "data_received";
      
      // Save mock intake
      db.intakes[sessionId] = {
        order_reference: sessionId,
        customer_email: order.customer_email,
        style: selectedStyle,
        script: scriptText,
        training_video_path: `mock-storage/raw-videos/${sessionId}/video.mp4`,
        training_video_bucket: "raw-videos",
        status: "received",
        created_at: new Date().toISOString(),
        liability_accepted_at: new Date().toISOString()
      };
      
      saveMockDb(db);

      return NextResponse.json({
        success: true,
        redirectUrl: "/intake/success"
      });
    }

    const supabase = createSupabaseAdmin();

    // 1. Double check server-side security validation against orders table
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("customer_email, payment_status")
      .eq("stripe_session_id", sessionId)
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
      .eq("order_reference", sessionId)
      .maybeSingle();

    if (existingIntake) {
      return NextResponse.json(
        { error: "El material de producción para este pedido ya ha sido cargado anteriormente." },
        { status: 400 }
      );
    }

    // 3. Connect to Supabase and update the orders table setting status to 'data_received'
    const { error: updateOrderError } = await supabase
      .from("orders")
      .update({ status: "data_received", updated_at: new Date().toISOString() })
      .eq("stripe_session_id", sessionId);

    if (updateOrderError) {
      return NextResponse.json(
        { error: "Fallo al actualizar el estado de la orden en la base de datos." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      redirectUrl: "/intake/success"
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor al procesar los datos de producción." },
      { status: 500 }
    );
  }
}

// PUT /api/process-reel?action=mock-upload&order_reference=XXX
// Handles proxy uploads locally (in mock mode) or securely uploads to real Supabase Storage (in production)
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const orderReference = searchParams.get("order_reference");

    if (action === "mock-upload" && orderReference) {
      console.log("Receiving video file PUT upload proxy for:", orderReference);
      
      // 1. MIME type validation
      const contentType = request.headers.get("content-type") || "";
      if (!contentType.startsWith("video/mp4") && !contentType.startsWith("video/quicktime")) {
        return NextResponse.json(
          { error: "Tipo de archivo no permitido. Solo se aceptan formatos MP4 y MOV.", code: "INVALID_MIME_TYPE" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await request.arrayBuffer());
      const sizeBytes = buffer.length;

      // 2. Empty file validation
      if (sizeBytes === 0) {
        return NextResponse.json(
          { error: "El archivo de vídeo está vacío.", code: "EMPTY_FILE" },
          { status: 400 }
        );
      }

      // 3. Max file size validation (500 MB)
      const MAX_SIZE = 500 * 1024 * 1024;
      if (sizeBytes > MAX_SIZE) {
        return NextResponse.json(
          { error: "El archivo de vídeo supera el límite de 500 MB.", code: "FILE_TOO_LARGE" },
          { status: 400 }
        );
      }

      // TODO: Integrate ffprobe to perform deep inspections of container, codec (H.264), bitrate, frame rate, duration, and audio formats.

      if (isMockMode()) {
        log("upload_started", { order_reference: orderReference, mode: "mock" });
        // Save directly to the local public folder (Mock Mode)
        const filePath = path.resolve(
          process.cwd(), 
          `public/mock-storage/raw-videos/${orderReference}/video.mp4`
        );
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, buffer);
        log("upload_succeeded", {
          order_reference: orderReference,
          file_path: filePath,
          mode: "mock"
        });
        return NextResponse.json({ success: true });
      } else {
        // Upload from our Next.js backend to real Supabase Storage (Production Mode)
        // This completely bypasses browser-side CORS issues!
        log("upload_started", { order_reference: orderReference, mode: "production" });
        const supabase = createSupabaseAdmin();
        const storagePath = `${orderReference}/video.mp4`;

        let { data, error } = await supabase.storage
          .from("raw-videos")
          .upload(storagePath, buffer, {
            contentType: "video/mp4",
            upsert: true
          });

        if (error) {
          console.warn("[PRODUCTION] Supabase Storage upload error. Attempting to auto-create 'raw-videos' bucket...", error.message);
          // Try to auto-create the bucket using service role key
          await supabase.storage.createBucket("raw-videos", { public: true });
          
          // Retry upload
          const retry = await supabase.storage
            .from("raw-videos")
            .upload(storagePath, buffer, {
              contentType: "video/mp4",
              upsert: true
            });
            
          data = retry.data;
          error = retry.error;
        }

        if (error) {
          log("upload_failed", {
            order_reference: orderReference,
            error: error,
            mode: "production"
          });
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        log("upload_succeeded", {
          order_reference: orderReference,
          path: data?.path,
          mode: "production"
        });
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ error: "Acción no autorizada." }, { status: 400 });
  } catch (err: any) {
    console.error("Error in upload PUT proxy handler:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
