import { NextResponse } from "next/server";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("CRITICAL: STRIPE_SECRET_KEY is missing from environment variables!");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(request: Request) {
  try {
    // 💜 Fix 1: Extract 'productId' from payload so it can be used below!
    const { productId, name, price, image, quantity, size } = await request.json();

    if (!productId || !name || !price) {
      return NextResponse.json(
        { error: `Missing payload elements. Product ID: ${productId}, Name: ${name}, Price: ${price}` },
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

    // Stripe only accepts absolute HTTPS links for checkout images.
    // This safely keeps relative paths from crashing checkout.
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
              name: name, // e.g. "Nike Dunk Low Grey (UK 9)"
              images: stripeImages, // 💜 Fix 2: Use the verified absolute image array
            },
            unit_amount: unitAmount, // 💜 Fix 3: Use the pre-calculated, verified unit amount
          },
          quantity: Number(quantity) || 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/product/${productId}`,
      // 💜 Pass all metadata safely so webhook can capture it properly
      metadata: {
        productId: productId,
        productName: name,
        size: size || "Standard",
        quantity: String(quantity || "1"),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal Stripe Gateway Crash";
    console.error("Stripe gateway pipeline failure:", error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}