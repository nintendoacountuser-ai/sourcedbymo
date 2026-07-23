import { NextResponse } from "next/server";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("CRITICAL: STRIPE_SECRET_KEY is missing!");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let metadata: Record<string, string> = {};

    // CHECK IF PAYLOAD IS FROM CART (ARRAY OF ITEMS)
    if (body.items && Array.isArray(body.items)) {
      lineItems = body.items.map((item: any) => {
        const stripeImages =
          item.image && (item.image.startsWith("http://") || item.image.startsWith("https://"))
            ? [item.image]
            : [];

        return {
          price_data: {
            currency: "gbp",
            product_data: {
              name: item.name,
              images: stripeImages,
            },
            unit_amount: Math.round(Number(item.price) * 100),
          },
          quantity: Number(item.quantity) || 1,
        };
      });

      metadata = { type: "cart_checkout", itemCount: String(body.items.length) };
    }
    // OTHERWISE HANDLE SINGLE ITEM PAYLOAD (BUY NOW)
    else {
      const { productId, name, price, image, quantity, size } = body;

      if (!productId || !name || !price) {
        return NextResponse.json(
          { error: "Missing required product details for checkout." },
          { status: 400 }
        );
      }

      const stripeImages =
        image && (image.startsWith("http://") || image.startsWith("https://"))
          ? [image]
          : [];

      lineItems = [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: name,
              images: stripeImages,
            },
            unit_amount: Math.round(Number(price) * 100),
          },
          quantity: Number(quantity) || 1,
        },
      ];

      metadata = {
        productId: String(productId),
        productName: String(name),
        size: String(size || "Standard"),
        quantity: String(quantity || "1"),
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/`,
      metadata: metadata,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal Stripe Error";
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}