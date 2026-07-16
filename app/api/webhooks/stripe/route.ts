import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const resend = new Resend(process.env.RESEND_API_KEY || "");

// 💜 Clean type wrapper for the metadata payload Stripe returns
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
    // Verify the webhook came from Stripe securely using your Webhook Secret
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook signature parsing failure";
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  // Handle the specific successful checkout event
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
        // 📧 1. Send confirmation email to the Customer
        await resend.emails.send({
          from: "Shop Updates <onboarding@resend.dev>", // Replace with your domain later if you verify one
          to: customerEmail,
          subject: "Secure Order Line: Purchase Confirmed!",
          html: `
            <div style="font-family: sans-serif; background-color: #050505; color: #ffffff; padding: 30px; border-radius: 20px;">
              <h1 style="color: #a855f7;">Your Order is Confirmed!</h1>
              <p>Thank you for your purchase. Your secure allocation has been processed successfully.</p>
              <hr style="border-color: #2e1065;" />
              <p><strong>Item:</strong> ${productName}</p>
              <p><strong>Size Variant:</strong> ${size}</p>
              <p><strong>Quantity Count:</strong> ${quantity}</p>
              <p><strong>Total Amount Cleared:</strong> £${totalPaid.toFixed(2)}</p>
              <hr style="border-color: #2e1065;" />
              <p style="color: #a3a3a3; font-size: 12px;">Secured Server Dispatch Routing Node</p>
            </div>
          `,
        });

        // 📧 2. Send notification copy to YOU (The Admin)
        await resend.emails.send({
          from: "Store Alert <onboarding@resend.dev>",
          to: "your-admin-email@example.com", // 💜 Put your personal email address here!
          subject: `🚨 NEW SALE: £${totalPaid.toFixed(2)} received!`,
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>Incoming Order Metrics Logged</h2>
              <p><strong>Customer:</strong> ${customerEmail}</p>
              <p><strong>Product Name:</strong> ${productName}</p>
              <p><strong>Size Selected:</strong> ${size}</p>
              <p><strong>Quantity:</strong> ${quantity}</p>
              <p><strong>Payout Total:</strong> £${totalPaid.toFixed(2)}</p>
            </div>
          `,
        });

      } catch (emailError) {
        console.error("Failed to route checkout emails safely:", emailError);
      }
    }
  }

  return NextResponse.json({ received: true });
}