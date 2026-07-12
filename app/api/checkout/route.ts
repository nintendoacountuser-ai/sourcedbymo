// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY || "";

// 🎯 Removed apiVersion completely so Stripe uses your account's default stable version
const stripe = new Stripe(secretKey);

interface CheckoutRequestBody {
  productName: string;
  price: string | number;
  image?: string;
  selectedSize?: string;
}

export async function POST(request: Request) {
  if (!secretKey) {
    console.error("❌ STRIPE_SECRET_KEY is completely missing from your environmental setup!");
    return NextResponse.json({ error: "Stripe key is not configured." }, { status: 500 });
  }

  try {
    const body = (await request.json()) as CheckoutRequestBody;
    const { productName, price, image, selectedSize } = body;

    const rawNumericPrice = typeof price === "string"
      ? parseFloat(price.replace(/[^0-9.]/g, ""))
      : price;

    // Fixed 'throw of exception caught locally' error by returning a clean response directly
    if (isNaN(rawNumericPrice)) {
      console.error(`Invalid price argument parse error: ${price}`);
      return NextResponse.json({ error: "Invalid price format structural data." }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      /* 🎯 Forces Stripe to create a customer profile and collect their email address */
      customer_creation: "always",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `${productName}${selectedSize && selectedSize !== "Default" ? ` (Size: ${selectedSize})` : ""}`,
              images: image && image.startsWith("http") ? [image] : [],
            },
            unit_amount: Math.round(rawNumericPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get("origin")}/`,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown checkout context error";
    console.error("Stripe Session Creation Internal Error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}