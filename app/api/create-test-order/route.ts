import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { isMockMode, getMockDb, saveMockDb } from "@/lib/mockDb";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const testSessionId = "test-order-instant-magic";

    if (isMockMode()) {
      console.log("[MOCK MODE] Generating/resetting paid test order in local JSON database...");
      
      const db = getMockDb();
      
      // Reset the test order state to 'paid' to allow infinite re-testing
      db.orders[testSessionId] = {
        stripe_session_id: testSessionId,
        package_id: "monologo",
        customer_email: "test-actor@reeltwin.ai",
        payment_status: "paid",
        status: "paid",
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Clear any pre-existing completed intake record for this session
      if (db.intakes[testSessionId]) {
        delete db.intakes[testSessionId];
      }
      
      saveMockDb(db);

      // Gorgeous visual redirect page pointing directly to the intake form
      return new Response(
        `<html>
          <head>
            <title>ReelTwin.ai - Test Helper [Sandbox]</title>
          </head>
          <body style="font-family: sans-serif; background: #08090b; color: #f3f3ee; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0;">
            <div style="text-align: center; border: 1px solid rgba(83, 215, 194, 0.15); background: #12161a; padding: 3rem; border-radius: 16px; max-width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              <div style="font-size: 2.5rem; margin-bottom: 1.5rem;">⚙️</div>
              <h2 style="margin: 0; font-size: 1.5rem; font-weight: 700; color: #53d7c2;">¡Modo Sandbox Activado!</h2>
              <p style="color: #9ca3a3; font-size: 0.9rem; line-height: 1.6; margin-top: 1rem; margin-bottom: 2rem;">
                Como no tienes Supabase configurado todavía, hemos activado el **Modo Sandbox Local**. Creamos un pedido ficticio pagado con ID <code style="background: #08090b; padding: 4px 8px; border-radius: 4px; font-family: monospace; color: #53d7c2;">test-order-instant-magic</code> en tu disco local de forma 100% libre de configuraciones.
              </p>
              <a href="/intake?session_id=test-order-instant-magic" style="display: inline-block; background: #53d7c2; color: #08090b; padding: 14px 28px; border-radius: 999px; text-decoration: none; font-weight: bold; font-size: 0.95rem; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
                Ir al Formulario de Captura →
              </a>
            </div>
          </body>
        </html>`,
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    const supabase = createSupabaseAdmin();

    console.log("Generating/resetting paid test order via temporary helper endpoint...");

    // First delete any pre-existing intake for this test session to allow repeated sandbox testing
    await supabase
      .from("intakes")
      .delete()
      .eq("order_reference", testSessionId);

    // Upsert the test order directly in Supabase using the server's secure admin client
    const { error } = await supabase
      .from("orders")
      .upsert({
        stripe_session_id: testSessionId,
        package_id: "monologo",
        customer_email: "test-actor@reeltwin.ai",
        amount_total: 2900,
        currency: "eur",
        payment_status: "paid",
        status: "paid",
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: "stripe_session_id"
      });

    if (error) {
      return new Response(
        `<html>
          <body style="font-family: sans-serif; background: #08090b; color: #ff6666; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0;">
            <div style="text-align: center; border: 1px solid rgba(255, 102, 102, 0.2); background: #12161a; padding: 2.5rem; border-radius: 12px; max-width: 450px;">
              <h2>❌ Error al crear pedido de prueba</h2>
              <p style="color: #9ca3a3; font-size: 14px; margin-top: 10px;">${error.message}</p>
              <p style="color: #9ca3a3; font-size: 12px; margin-top: 20px; font-style: italic;">Asegúrate de que las variables de Supabase estén bien configuradas en el servidor.</p>
            </div>
          </body>
        </html>`,
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    // Return a gorgeous visual redirect page pointing directly to the intake form!
    return new Response(
      `<html>
        <head>
          <title>ReelTwin.ai - Test Helper</title>
        </head>
        <body style="font-family: sans-serif; background: #08090b; color: #f3f3ee; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="text-align: center; border: 1px solid rgba(215, 255, 84, 0.15); background: #12161a; padding: 3rem; border-radius: 16px; max-width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="font-size: 2.5rem; margin-bottom: 1.5rem;">🎉</div>
            <h2 style="margin: 0; font-size: 1.5rem; font-weight: 700;">¡Pedido de Prueba Creado!</h2>
            <p style="color: #9ca3a3; font-size: 0.9rem; line-height: 1.6; margin-top: 1rem; margin-bottom: 2rem;">
              Hemos creado y marcado como <strong>PAGADO</strong> un pedido simulado con ID <code style="background: #08090b; padding: 4px 8px; border-radius: 4px; font-family: monospace; color: #d7ff54;">test-order-instant-magic</code> en tu base de datos de Supabase de forma 100% segura.
            </p>
            <a href="/intake?session_id=test-order-instant-magic" style="display: inline-block; background: #d7ff54; color: #08090b; padding: 14px 28px; border-radius: 999px; text-decoration: none; font-weight: bold; font-size: 0.95rem; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
              Ir al Formulario de Captura →
            </a>
          </div>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );

  } catch (err: any) {
    return new Response(
      `<html>
        <body style="font-family: sans-serif; background: #08090b; color: #ff6666; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="text-align: center; border: 1px solid rgba(255, 102, 102, 0.2); background: #12161a; padding: 2.5rem; border-radius: 12px;">
            <h2>❌ Fallo del servidor</h2>
            <p style="color: #9ca3a3; font-size: 14px;">${err.message}</p>
          </div>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}
