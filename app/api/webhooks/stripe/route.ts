import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { supabase } from "@/app/lib/supabase"; // 💜 Fix 1: Moved import to the top of the file

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

interface CheckoutMetadata {
  productId?: string; // 💜 Added to metadata type
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

  // 💜 Fix 2: Wrap all success actions inside the checkout session completed block
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const customerEmail = session.customer_details?.email;
    const totalPaid = session.amount_total ? session.amount_total / 100 : 0;
    const metadata = (session.metadata || {}) as CheckoutMetadata;

    const productId = metadata.productId;
    const purchasedSize = metadata.size;
    const purchasedQty = Number(metadata.quantity || "1");

    const productName = metadata.productName || "Premium Asset Item";
    const sizeName = metadata.size || "Standard";

    console.log(`🔔 Payment checkout successful for product: ${productId}`);

    // --- SECTION A: UPDATE SUPABASE STOCK ---
    if (productId && purchasedSize) {
      try {
        // 1. Get the current product's stock mapping
        const { data: product, error: fetchError } = await supabase
          .from("products")
          .select("size_stock")
          .eq("id", productId)
          .single();

        if (fetchError) {
          console.error("Supabase fetch error during stock reduction:", fetchError);
        } else if (product) {
          // Cast the size_stock column as a safe record object
          const currentStock = (product.size_stock || {}) as Record<string, number>;
          const sizeStockAmount = Number(currentStock[purchasedSize] || 0);

          // Calculate new stock (ensuring it doesn't go below 0)
          const newStockAmount = Math.max(0, sizeStockAmount - purchasedQty);

          const updatedStock = {
            ...currentStock,
            [purchasedSize]: newStockAmount
          };

          // 2. Write the decremented stock back to the database
          const { error: updateError } = await supabase
            .from("products")
            .update({ size_stock: updatedStock })
            .eq("id", productId);

          if (updateError) {
            console.error("Supabase update error during stock reduction:", updateError);
          } else {
            console.log(`📉 Stock updated for ${productId} size ${purchasedSize}: ${newStockAmount} remaining.`);
          }
        }
      } catch (dbError) {
        console.error("Database pipeline failed during stock reduction:", dbError);
      }
    }

    // --- SECTION B: ROUTE CONFIRMATION EMAILS ---
    if (customerEmail) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder_key_for_builds");

        // 📧 1. Send confirmation email to the Customer
        await resend.emails.send({
          from: "Shop Updates <onboarding@resend.dev>",
          to: customerEmail,
          subject: "Secure Order Line: Purchase Confirmed!",
          html: `<h1>Your Order is Confirmed!</h1><p>Item: ${productName} (${sizeName})</p>`,
        });

      } catch (emailError) {
        console.error("Failed to route checkout emails safely:", emailError);
      }
    }
  }

  return NextResponse.json({ received: true });
}