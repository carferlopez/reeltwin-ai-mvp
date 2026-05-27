import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createStripeClient } from "@/lib/stripe";
import { requiredEnv } from "@/lib/env";

export const runtime = "nodejs";

const QUOTA_BY_TIER = { pro: 20, studio: 60 } as const;

// ─── Email template ───────────────────────────────────────────────────────────
function buildWelcomeEmail(tier: string, quota: number, magicLink: string): string {
  const tierLabel = tier === "studio" ? "Studio" : "Pro";
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tu Studio está listo</title>
</head>
<body style="margin:0;padding:0;background:#08090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#08090b;padding:48px 24px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:40px;">
              <span style="font-size:1.4rem;font-weight:700;color:#fff;letter-spacing:-0.02em;">
                ReelTwin<span style="color:#d7ff54;">.ai</span>
              </span>
            </td>
          </tr>

          <!-- Headline -->
          <tr>
            <td style="padding-bottom:12px;">
              <h1 style="margin:0;font-size:2rem;font-weight:700;color:#fff;line-height:1.15;">
                Tu Studio está listo.
              </h1>
            </td>
          </tr>

          <!-- Subtext -->
          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0;font-size:1.05rem;color:#9aa3ad;line-height:1.6;">
                Tu suscripción <strong style="color:#fff;">${tierLabel}</strong> está activa.<br/>
                Tienes <strong style="color:#d7ff54;">${quota} generaciones</strong> este mes a tu disposición.
              </p>
            </td>
          </tr>

          <!-- CTA button -->
          <tr>
            <td style="padding-bottom:40px;">
              <a href="${magicLink}"
                 style="display:inline-block;background:#d7ff54;color:#08090b;font-size:1rem;
                        font-weight:700;text-decoration:none;padding:16px 36px;
                        border-radius:999px;letter-spacing:-0.01em;">
                Entrar a mi Studio →
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="border-top:1px solid #20262c;padding-top:28px;padding-bottom:8px;">
              <p style="margin:0;font-size:0.85rem;color:#4a5260;line-height:1.6;">
                El enlace es de un solo uso y expira en 24h. Si caduca, visita
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login"
                   style="color:#9aa3ad;text-decoration:underline;">
                  reeltwin.ai/login
                </a>
                y te enviamos uno nuevo al instante.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:20px;">
              <p style="margin:0;font-size:0.8rem;color:#2e343b;">
                © ReelTwin.ai · Carlos Makes, 2026
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Webhook handler ──────────────────────────────────────────────────────────
export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    console.error("[stripe-webhook] Missing Stripe signature");
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const stripe = createStripeClient();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      requiredEnv("STRIPE_WEBHOOK_SECRET")
    );
  } catch (err: any) {
    console.error(`[stripe-webhook] Invalid Stripe signature: ${err.message}`);
    return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
  }

  console.log(`[stripe-webhook] Evento recibido de Stripe: ${event.type}`);

  const supabase = createSupabaseAdmin();

  // ── Legacy: one-off checkout sessions ────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(`[stripe-webhook] Procesando checkout.session.completed heredado: ${session.id}`);
    const packageId = session.metadata?.package_id ?? "unknown";
    const customerEmail =
      session.customer_details?.email ?? session.customer_email ?? "unknown";
    console.log(`[stripe-webhook] Email del cliente obtenido: ${customerEmail}`);

    const { error } = await supabase.from("orders").upsert(
      {
        stripe_session_id: session.id,
        package_id: packageId,
        customer_email: customerEmail,
        amount_total: session.amount_total ?? 0,
        currency: session.currency ?? "eur",
        payment_status: session.payment_status,
        status: "paid",
        paid_at: new Date().toISOString(),
      },
      { onConflict: "stripe_session_id" }
    );
    if (error) {
      console.error("[stripe-webhook] Error al registrar el pedido heredado en base de datos:", error);
      return NextResponse.json({ error: "Order write failed" }, { status: 500 });
    }
    console.log(`[stripe-webhook] Pedido heredado registrado/actualizado con éxito.`);
  }

  // ── Subscription created ──────────────────────────────────────────────────
  if (event.type === "customer.subscription.created") {
    const subscription = event.data.object as Stripe.Subscription;
    console.log(`[stripe-webhook] Procesando customer.subscription.created: ${subscription.id}`);

    const customer = await stripe.customers.retrieve(subscription.customer as string);
    const email = (customer as Stripe.Customer).email!;
    console.log(`[stripe-webhook] Email del cliente obtenido de Stripe: ${email}`);

    const tier = subscription.items.data[0].price.lookup_key as "pro" | "studio";
    const quota = QUOTA_BY_TIER[tier] ?? 20;
    console.log(`[stripe-webhook] Datos del plan: tier=${tier}, quota=${quota}`);

    // Upsert subscription row
    const { error: subErr } = await supabase.from("subscriptions").upsert(
      {
        stripe_subscription_id: subscription.id,
        customer_email: email,
        tier,
        status: "active",
        quota_total: quota,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      },
      { onConflict: "stripe_subscription_id" }
    );

    if (subErr) {
      console.error("[stripe-webhook] Error al insertar/actualizar suscripción en base de datos:", subErr);
      return NextResponse.json({ error: "Subscription write failed" }, { status: 500 });
    }
    console.log(`[stripe-webhook] Suscripción registrada/actualizada con éxito en base de datos para: ${email}`);

    // Generate magic link + send welcome email wrapped in a robust try/catch
    try {
      console.log(`[stripe-webhook] Generando enlace mágico de acceso para: ${email}`);
      const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/studio` },
      });

      if (linkErr || !linkData?.properties?.action_link) {
        throw new Error(linkErr?.message || "No se pudo generar el enlace mágico de Supabase Auth.");
      }

      const magicLink = linkData.properties.action_link;
      console.log("[stripe-webhook] Enlace mágico de acceso generado correctamente.");

      console.log(`[stripe-webhook] Enviando email de bienvenida via Resend a: ${email} (desde: ${process.env.RESEND_FROM_EMAIL})`);
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error: emailErr } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: email,
        subject: `Tu Studio ReelTwin está listo — ${quota} generaciones te esperan`,
        html: buildWelcomeEmail(tier, quota, magicLink),
      });

      if (emailErr) {
        throw emailErr;
      }
      console.log("[stripe-webhook] Email de bienvenida enviado con éxito via Resend.");
    } catch (err: any) {
      // Non-fatal error: subscription is already committed in the DB, just log the issue.
      // Returning a 200 to Stripe prevents endless retries of the webhook event.
      console.error(`[stripe-webhook] Error no fatal en flujo de onboarding/email: ${err.message || err}`);
    }
  }

  // ── Subscription updated ──────────────────────────────────────────────────
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    console.log(`[stripe-webhook] Procesando customer.subscription.updated: ${subscription.id}`);
    const tier = subscription.items.data[0].price.lookup_key as "pro" | "studio";
    const quota = QUOTA_BY_TIER[tier] ?? 20;

    const statusMap: Record<string, string> = {
      active: "active",
      past_due: "past_due",
      canceled: "canceled",
      unpaid: "past_due",
      trialing: "active",
    };

    const status = statusMap[subscription.status] ?? "active";
    console.log(`[stripe-webhook] Actualizando estado de suscripción a: ${status} (tier: ${tier}, quota: ${quota})`);

    const { error } = await supabase
      .from("subscriptions")
      .update({
        tier,
        status,
        quota_total: quota,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id);

    if (error) {
      console.error("[stripe-webhook] Error al actualizar la suscripción en base de datos:", error);
      return NextResponse.json({ error: "Subscription update failed" }, { status: 500 });
    }
    console.log(`[stripe-webhook] Suscripción ${subscription.id} actualizada con éxito en base de datos.`);
  }

  // ── Subscription deleted ──────────────────────────────────────────────────
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    console.log(`[stripe-webhook] Procesando customer.subscription.deleted: ${subscription.id}`);

    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "canceled" })
      .eq("stripe_subscription_id", subscription.id);

    if (error) {
      console.error("[stripe-webhook] Error al marcar suscripción como cancelada en base de datos:", error);
      return NextResponse.json({ error: "Subscription cancel failed" }, { status: 500 });
    }
    console.log(`[stripe-webhook] Suscripción ${subscription.id} marcada como cancelada con éxito.`);
  }

  return NextResponse.json({ received: true });
}
