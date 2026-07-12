"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState<string>("Default");
  const [orderStatus, setOrderStatus] = useState<string>("Checking stock levels...");

  useEffect(() => {
    if (!id) return;

    async function fetchProductDetails() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (!error && data) {
          setProduct(data);
          if (data.sizes && data.sizes.length > 0) {
            setSelectedSize("");
            setOrderStatus("");
          } else {
            setOrderStatus("");
          }
        }
      } catch (err) {
        console.error("Error fetching product detail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProductDetails();
  }, [id]);

  const handlePaymentCheckout = async () => {
    if (product?.sizes && product.sizes.length > 0 && !selectedSize) {
      setOrderStatus("❌ Please select an available size configuration before placing your order allocation.");
      return;
    }

    setOrderStatus("⚡ Initializing secure payment node... redirecting to Stripe");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: product.name,
          price: product.price,
          image: product.image,
          selectedSize: selectedSize !== "Default" ? selectedSize : null,
        }),
      });

      const session = await response.json();

      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error("Failed to create checkout line session.");
      }
    } catch (err) {
      console.error(err);
      setOrderStatus("❌ Merchant gateway connection failed. Please try again or use the support line below.");
    }
  };

  if (loading) {
    return (
      /* 💜 Updated Loading with dynamic purple pulse accents */
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <p className="text-sm font-medium animate-pulse tracking-widest uppercase text-purple-400/80">Syncing stock item specs...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4">
        <p className="text-lg font-medium text-gray-400">Product not found or asset has been sold.</p>
        <button onClick={() => router.push("/")} className="mt-4 px-6 py-2 bg-neutral-900 text-purple-400 rounded-full border border-neutral-800 text-xs font-semibold">
          Return to Catalog
        </button>
      </div>
    );
  }

  const supportMessage = encodeURIComponent(
    `Hey Mo, I am on the product page for the ${product.name} (£${product.price}) and had a quick question regarding shipping or sizes.`
  );

  return (
    /* 💜 Gradient shifted to deep black-out violet profile matching logo background atmosphere */
    <main className="min-h-screen bg-gradient-to-b from-[#0f0a1c] via-[#050507] to-[#020203] text-white px-4 md:px-12 py-8 md:py-16">
      <div className="max-w-5xl mx-auto mb-6">
        <Link href="/" className="text-xs font-semibold text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2 w-fit">
          ← Back to Live Catalog
        </Link>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 bg-[#120f1a]/40 backdrop-blur-md border border-purple-950/30 p-6 md:p-10 rounded-3xl shadow-[0_0_50px_rgba(147,51,234,0.06)] relative overflow-hidden">

        {/* Left Column: Image Showcase with subtle dynamic outline */}
        <div className="w-full aspect-square bg-neutral-950 flex items-center justify-center overflow-hidden rounded-2xl border border-neutral-900 p-4 shadow-inner">
          <img src={product.image || "/images/placeholder.png"} alt={product.name} className="w-full h-full object-contain max-h-[400px]" />
        </div>

        {/* Right Column: Info Details Panel */}
        <div className="flex flex-col justify-between">
          <div>
            {/* 💜 Status Pill shifted to neon purple transparent backdrop */}
            <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20 text-purple-400 w-fit">
              {product.status || "Live Stock"}
            </span>
            <h1 className="mt-4 text-2xl md:text-4xl font-black tracking-tight text-gray-100">{product.name}</h1>
            <div className="mt-4 flex items-baseline gap-2">
              {/* 💜 Main price accent color flipped to premium neon purple highlight */}
              <span className="text-2xl md:text-3xl font-black text-purple-400">
                {typeof product.price === 'string' && product.price.startsWith?.('£') ? product.price : `£${product.price}`}
              </span>
            </div>

            <p className="mt-6 text-sm md:text-base text-gray-400 border-t border-neutral-900/60 pt-6">{product.description}</p>

            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-6 pt-4 border-t border-neutral-900/40">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Available Sizes</h3>
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => { setSelectedSize(size); setOrderStatus(""); }}
                      /* 💜 Interactive selection borders switched from yellow to active neon purple glow profiles */
                      className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedSize === size ? "bg-purple-600 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-105" : "bg-neutral-950 border-neutral-850 text-gray-300 hover:border-purple-900/60"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-900/60 flex flex-col gap-3">
            {orderStatus && (
              <p className={`p-3 rounded-xl text-xs text-center font-semibold border ${
                orderStatus.startsWith("❌") ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-purple-500/10 border-purple-500/20 text-purple-300 animate-pulse"
              }`}>
                {orderStatus}
              </p>
            )}

            {/* 💜 Checkout button matches the gradient look of the "SOURCED BY MO" title line typography */}
            <button
              onClick={handlePaymentCheckout}
              className="w-full py-4 bg-gradient-to-r from-purple-600 via-purple-500 to-violet-400 text-white font-extrabold text-sm rounded-xl text-center hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(168,85,247,0.25)] active:scale-[0.99] transition-all cursor-pointer"
            >
              💳 Instant Checkout Via Card / Pay
            </button>

            <a
              href={`https://wa.me/447000000000?text=${supportMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 text-gray-400 hover:text-purple-400 rounded-xl text-center text-xs font-bold transition-all shadow-sm"
            >
              💬 Have Questions? Ask Mo via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}