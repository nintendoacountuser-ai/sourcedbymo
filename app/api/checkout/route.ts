import { NextResponse } from "next/server";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("CRITICAL: STRIPE_SECRET_KEY is missing from environment variables!");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(request: Request) {
  try {
    // 💜 Fix 1: Make sure 'size' is pulled alongside name, price, image, and quantity
    const { name, price, image, quantity, size } = await request.json();

    if (!name || !price) {
      return NextResponse.json(
        { error: `Missing payload elements. Name: ${name}, Price: ${price}` },
        { status: 400 }
      );
    }

    const unitAmount = Math.round(Number(price) * 100);
    if (isNaN(unitAmount) || unitAmount <= 0) {
      return NextResponse.json(
        { error: `Invalid parsed currency calculation total: ${price}` },
        { status: 400 }
      );
    }

    const origin = request.headers.get("origin") || "http://localhost:3000";

    const stripeImages = image && (image.startsWith("http://") || image.startsWith("https://"))
      ? [image]
      : [];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: name,
              images: stripeImages, // 💜 Fix 2: 'stripeImages' is now actively consumed here
            },
            unit_amount: unitAmount,
          },
          quantity: quantity ? Number(quantity) : 1,
        },
      ],
      mode: "payment",

      // 💜 Fix 3: Passed the destructured 'size' parameter straight into metadata safely
      metadata: {
        productName: name,
        size: size || "Not Specified",
        quantity: quantity ? quantity.toString() : "1"
      },

      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) { // 💜 Fix 4: Removed ': any' to clear ESLint warnings completely
    const errorMessage = error instanceof Error ? error.message : "Internal Stripe Gateway Crash";
    console.error("Stripe gateway pipeline failure:", error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}