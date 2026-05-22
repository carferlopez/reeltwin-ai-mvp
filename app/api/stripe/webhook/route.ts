import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createStripeClient } from "@/lib/stripe";
import { requiredEnv } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = createStripeClient().webhooks.constructEvent(
      body,
      signature,
      requiredEnv("STRIPE_WEBHOOK_SECRET")
    );
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabase = createSupabaseAdmin();

    const packageId = session.metadata?.package_id ?? "unknown";
    const customerEmail =
      session.customer_details?.email ?? session.customer_email ?? "unknown";

    const { error } = await supabase.from("orders").upsert(
      {
        stripe_session_id: session.id,
        package_id: packageId,
        customer_email: customerEmail,
        amount_total: session.amount_total ?? 0,
        currency: session.currency ?? "eur",
        payment_status: session.payment_status,
        status: "paid",
        paid_at: new Date().toISOString()
      },
      { onConflict: "stripe_session_id" }
    );

    if (error) {
      return NextResponse.json({ error: "Order write failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
