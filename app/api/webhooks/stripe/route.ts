import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// 💜 Fix: Do NOT initialize Resend globally at the top of the file!

interface CheckoutMetadata {
  productName?: string;
  size?: string;
  quantity?: string;
}

export async function POST(request: Request) {
  const payload = await request.text();
  const sig = request.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook signature parsing failure";
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const customerEmail = session.customer_details?.email;
    const totalPaid = session.amount_total ? session.amount_total / 100 : 0;
    const metadata = (session.metadata || {}) as CheckoutMetadata;

    const productName = metadata.productName || "Premium Asset Item";
    const size = metadata.size || "Standard";
    const quantity = metadata.quantity || "1";

    if (customerEmail) {
      try {
        // 💜 Fix: Instantiate Resend right here, safely inside the execution context!
        const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder_key_for_builds");

        await resend.emails.send({
          from: "Shop Updates <onboarding@resend.dev>",
          to: customerEmail,
          subject: "Secure Order Line: Purchase Confirmed!",
          html: `<h1>Your Order is Confirmed!</h1><p>Item: ${productName} (${size})</p>`,
        });

      } catch (emailError) {
        console.error("Failed to route checkout emails safely:", emailError);
      }
    }
  }

  return NextResponse.json({ received: true });
}