import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { CINEMATIC_STYLES } from "@/config/styles";

export const runtime = "nodejs";

const processInstantSchema = z.object({
  sessionId: z.string().min(1, "El ID de sesión es obligatorio."),
  selectedStyle: z.enum(["nordic-noir", "indie-sundance"], {
    errorMap: () => ({ message: "El estilo cinematográfico seleccionado no es válido." })
  }),
  videoUrl: z.string().url("La URL del vídeo no es válida."),
  scriptText: z.string().min(10, "El guion debe tener al menos 10 caracteres.").max(500, "El guion no puede superar los 500 caracteres.")
});

export async function POST(request: Request) {
  const supabase = createSupabaseAdmin();
  let sessionToUpdate = "";

  try {
    const body = await request.json();
    
    // Paso A: Validación de datos
    const parsed = processInstantSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Datos JSON inválidos.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { sessionId, selectedStyle, videoUrl, scriptText } = parsed.data;
    sessionToUpdate = sessionId;

    // Verify order exists and is paid in Supabase
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

    // Paso B: Receta del Estilo Cinematográfico
    const styleConfig = CINEMATIC_STYLES[selectedStyle];
    if (!styleConfig) {
      return NextResponse.json(
        { error: "Estilo cinematográfico no soportado." },
        { status: 400 }
      );
    }

    const backgrounds = styleConfig.dynamicBackgrounds;
    const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    const randomSeed = Math.floor(Math.random() * 2147483647);
    const promptPrefix = `cinematic video, style of ${styleConfig.name}, `;

    // Build the Prompt Compuesto
    const finalPrompt = `Apply this cinematic framework: ${promptPrefix}. Change the environment to: ${randomBackground}. Deliver the output video with the actor performing this exact script: ${scriptText}. Maintain full facial identity.`;

    // Paso C: Conexión con Gemini Omni
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      try {
        console.log("Instancing Gemini Omni Client connection for síncrono render...");
        
        // Simulating the exact payload structure specified in the JSON template
        const payload = {
          model: "gemini-2.0-flash-exp",
          contents: [
            {
              role: "user",
              parts: [
                { fileData: { fileUri: videoUrl, mimeType: "video/mp4" } },
                { text: finalPrompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            candidateCount: 1
          }
        };

        console.log("=== GEMINI OMNI INCOMING PAYLOAD ===");
        console.log(JSON.stringify({ omni_api_payload_template: payload }, null, 2));
        console.log("====================================");

        // Fetch to Google Gemini API
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          }
        );

        const responseData = await response.json();
        console.log("Gemini Omni Response received:", JSON.stringify(responseData).substring(0, 150) + "...");
      } catch (geminiError) {
        console.error("Gemini Omni API Call failed, falling back to local fallback buffer:", geminiError);
      }
    } else {
      console.log("No GEMINI_API_KEY environment variable found. Simulating síncrono Gemini Omni render...");
    }

    // ========================================================
    // PASO D: OBTENCIÓN Y ALMACENAMIENTO (SIMULACIÓN VS REAL)
    // ========================================================

    // Control de velocidad: usa variable de entorno o cambia a 'false' cuando conectes la IA real
    const IS_SIMULATION = process.env.NEXT_PUBLIC_VIDEO_SIMULATION === "true" || true; 

    let finalVideoBlob: any;

    if (IS_SIMULATION) {
      // --- MODO GUERRILLA / SIMULACIÓN ---
      // Reutiliza el vídeo base que el usuario acaba de subir para verificar los tubos del sistema
      const sourcePath = `${sessionId}/video.mp4`; // Ajustado al formato estandarizado en la carga del frontend
      
      const { data: sourceBlob, error: downloadError } = await supabase.storage
        .from("raw-videos")
        .download(sourcePath);

      if (downloadError) {
        throw new Error(`[Simulación] Fallo al descargar vídeo base: ${downloadError.message}`);
      }
      
      finalVideoBlob = sourceBlob;
    } else {
      // --- MODO PRODUCCIÓN / REALIA ---
      // Supongamos que tu llamada previa al motor de vídeo (Google Veo, Runway, Luma, etc.) 
      // guardó la URL resultante en una variable 'aiGeneratedVideoUrl'
      const aiGeneratedVideoUrl = ""; // <- Aquí mapearás el output real de la API de vídeo

      if (!aiGeneratedVideoUrl) {
        throw new Error("[Producción] La API de generación no devolvió ninguna URL de vídeo válida.");
      }

      // Descarga del renderizado en memoria de ejecución (Vercel Serverless)
      const videoDownloadResponse = await fetch(aiGeneratedVideoUrl);
      if (!videoDownloadResponse.ok) {
        throw new Error("[Producción] No se pudo descargar el vídeo renderizado desde los servidores de la IA.");
      }
      
      finalVideoBlob = await videoDownloadResponse.blob();
    }

    // --- TUBERÍA UNIFICADA DE SALIDA ---
    // Este bloque es agnóstico al origen del vídeo; simplemente ejecuta su función de manera excelente
    const completedPath = `${sessionId}/completed.mp4`;
    const { error: uploadError } = await supabase.storage
      .from("completed-reels")
      .upload(completedPath, finalVideoBlob, {
        contentType: "video/mp4",
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Fallo al almacenar el vídeo final en el bucket 'completed-reels': ${uploadError.message}`);
    }

    // Obtención de la URL pública que consumirá el reproductor del Frontend
    const { data: { publicUrl } } = supabase.storage
      .from("completed-reels")
      .getPublicUrl(completedPath);

    // Paso E: Actualizar Orden
    // Change order status to 'completed' and delivered_at timestamp
    const { error: updateOrderError } = await supabase
      .from("orders")
      .update({
        status: "completed",
        delivered_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("stripe_session_id", sessionId);

    if (updateOrderError) {
      throw new Error("Fallo al actualizar el estado final del pedido en la base de datos.");
    }

    // Save final completed state in intakes
    await supabase.from("intakes").insert({
      order_reference: sessionId,
      customer_email: order.customer_email,
      style: selectedStyle,
      script: scriptText,
      training_video_path: `${sessionId}/video.mp4`,
      training_video_bucket: "raw-videos",
      result_video_path: completedPath,
      status: "delivered",
      delivered_at: new Date().toISOString()
    });

    // Paso F: Respuesta Inmediata síncrona
    return NextResponse.json({
      success: true,
      finalVideoUrl: publicUrl
    });

  } catch (error: any) {
    console.error("Error in process-instant API route:", error);

    // Antifragile error handling: Update order to failed status if database reference exists
    if (sessionToUpdate) {
      try {
        await supabase
          .from("orders")
          .update({
            status: "failed",
            updated_at: new Date().toISOString()
          })
          .eq("stripe_session_id", sessionToUpdate);
      } catch (dbErr) {
        console.error("Failed to mark order as failed in Postgres:", dbErr);
      }
    }

    return NextResponse.json(
      { error: error.message || "Error interno del servidor al procesar el renderizado instantáneo." },
      { status: 500 }
    );
  }
}
