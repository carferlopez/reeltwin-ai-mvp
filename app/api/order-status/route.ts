import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { isMockMode, getMockDb } from "@/lib/mockDb";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Falta el ID de sesión." }, { status: 400 });
    }

    if (isMockMode()) {
      const db = getMockDb();
      const order = db.orders[sessionId];
      
      if (!order) {
        return NextResponse.json({ error: "Pedido no encontrado en modo sandbox." }, { status: 404 });
      }

      const intake = db.intakes[sessionId];
      const finalVideoUrl = intake ? `/mock-storage/completed-reels/${sessionId}/completed.mp4` : null;

      return NextResponse.json({
        success: true,
        status: order.status || "paid",
        finalVideoUrl: finalVideoUrl,
        customerEmail: order.customer_email || "cliente-test@reeltwin.ai",
        intakeReceived: !!intake
      });
    }

    const supabase = createSupabaseAdmin();

    // 1. Query order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("status, customer_email")
      .eq("stripe_session_id", sessionId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
    }

    // 2. Query intake to see if result is ready
    const { data: intake, error: intakeError } = await supabase
      .from("intakes")
      .select("status, result_video_path")
      .eq("order_reference", sessionId)
      .maybeSingle();

    let finalVideoUrl = null;
    if (intake && intake.status === "delivered" && intake.result_video_path) {
      const { data: { publicUrl } } = supabase.storage
        .from("completed-reels")
        .getPublicUrl(intake.result_video_path);
      finalVideoUrl = publicUrl;
    }

    return NextResponse.json({
      success: true,
      status: order.status,
      finalVideoUrl: finalVideoUrl,
      customerEmail: order.customer_email,
      intakeReceived: !!intake
    });

  } catch (error: any) {
    console.error("Error in api/order-status:", error);
    return NextResponse.json(
      { error: error.message || "Error interno al consultar el estado del pedido." },
      { status: 500 }
    );
  }
}
