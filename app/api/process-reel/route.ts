import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { CINEMATIC_STYLES } from "@/config/styles";

export const runtime = "nodejs";

// Validation Schema for JSON POST payload
const processReelSchema = z.object({
  sessionId: z.string().min(1, "El ID de sesión es obligatorio."),
  selectedStyle: z.enum(["nordic-noir", "indie-sundance"], {
    errorMap: () => ({ message: "El estilo cinematográfico seleccionado no es válido." })
  }),
  videoUrl: z.string().url("La URL del vídeo no es válida."),
  scriptText: z.string().min(10, "El guion debe tener al menos 10 caracteres.").max(500, "El guion no puede superar los 500 caracteres.")
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

    // Optional: issue a secure signed upload URL for direct client-side storage upload
    const action = searchParams.get("action");
    if (action === "get-upload-url") {
      const fileName = searchParams.get("filename") || "video.mp4";
      const extension = fileName.split(".").pop()?.toLowerCase() ?? "mp4";
      const storagePath = `${orderReference}/video.${extension}`;
      
      const { data: signedData, error: signedUrlError } = await supabase.storage
        .from("raw-videos")
        .createSignedUploadUrl(storagePath);

      if (signedUrlError || !signedData) {
        return NextResponse.json(
          { valid: false, error: "No se pudo generar la URL de subida." },
          { status: 500 }
        );
      }

      // Generate the public URL that will be populated after successful PUT upload
      const { data: { publicUrl } } = supabase.storage
        .from("raw-videos")
        .getPublicUrl(storagePath);

      return NextResponse.json({
        valid: true,
        email: order.customer_email,
        uploadUrl: signedData.signedUrl,
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

    // 4. Cinematic Franchise Logic
    const styleConfig = CINEMATIC_STYLES[selectedStyle];
    if (!styleConfig) {
      return NextResponse.json(
        { error: "Estilo cinematográfico no soportado." },
        { status: 400 }
      );
    }

    // Select a random background from dynamicBackgrounds based on style
    const backgrounds = styleConfig.dynamicBackgrounds;
    const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];

    // Generate a random seed number
    const randomSeed = Math.floor(Math.random() * 2147483647); // Max standard 32-bit int

    // Build the prompt prefix
    const promptPrefix = `cinematic video, style of ${styleConfig.name}, `;

    // Build definitive Payload ready for AI render
    const aiPayload = {
      input_video: videoUrl,
      prompt: `${promptPrefix}${randomBackground}, spoken: "${scriptText}"`,
      seed: randomSeed,
      status: "ready_for_render"
    };

    // Output definitive payload to console log simulating the AI API trigger
    console.log("=== AI PAYLOAD READY FOR RENDER ===");
    console.log(JSON.stringify({ target_api_payload_structure: aiPayload }, null, 2));
    console.log("====================================");

    // 5. Save final intake record in public.intakes for transactional security
    const { error: writeError } = await supabase.from("intakes").insert({
      order_reference: sessionId,
      customer_email: order.customer_email,
      style: selectedStyle,
      script: scriptText,
      training_video_path: `${sessionId}/video.mp4`, // standardized path as requested
      training_video_bucket: "raw-videos",
      status: "received"
    });

    if (writeError) {
      // Revert order status if writing intake fails
      await supabase
        .from("orders")
        .update({ status: "paid", updated_at: new Date().toISOString() })
        .eq("stripe_session_id", sessionId);

      return NextResponse.json(
        { error: "Fallo al registrar los datos de producción. Estado revertido." },
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
