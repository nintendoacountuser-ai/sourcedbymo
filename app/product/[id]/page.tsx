"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 👟 State to track which size the user clicks on
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [orderStatus, setOrderStatus] = useState<string>("");

  useEffect(() => {
    async function fetchProductDetails() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .single();

      if (!error && data) {
        setProduct(data);
      }
      setLoading(false);
    }
    fetchProductDetails();
  }, [params.id]);

  const handleOrderSubmit = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setOrderStatus("❌ Please select an available size configuration before placing your order allocation.");
      return;
    }

    setOrderStatus("⚡ Secure checkout route initialized! This asset line is ready to connect to Stripe or WhatsApp.");

    // Auto-clear message notification after 4 seconds
    setTimeout(() => setOrderStatus(""), 4000);
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center animate-pulse">Syncing stock item...</div>;
  if (!product) return <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center">Product not found.<button onClick={() => router.push("/")} className="mt-4 text-yellow-400">Return Home</button></div>;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-[#111] border border-neutral-900 rounded-3xl p-8 grid md:grid-cols-2 gap-8 items-center shadow-2xl">

        {/* Left Image Node */}
        <img src={product.image} alt={product.name} className="w-full aspect-square object-cover rounded-2xl bg-neutral-950 border border-neutral-850" />

        {/* Right Info Details Panel */}
        <div className="flex flex-col justify-center">
          <div>
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest bg-yellow-400/10 px-3 py-1 rounded-full">{product.status}</span>
            <h1 className="text-4xl font-black mt-3 text-white tracking-tight">{product.name}</h1>
            <p className="text-2xl font-bold text-gray-200 mt-2 font-mono">{product.price}</p>
            <p className="text-gray-400 mt-4 leading-relaxed text-sm">{product.description}</p>
          </div>

          {/* 👟 Interactive Size Selection Grid */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Available Sizes</h3>
              <div className="flex flex-wrap gap-2 mt-2.5">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setSelectedSize(size);
                      setOrderStatus(""); // Clear old error warnings
                    }}
                    className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedSize === size
                        ? "bg-yellow-400 text-black border-yellow-400 shadow-md scale-105"
                        : "bg-neutral-950 border-neutral-850 text-gray-300 hover:border-neutral-700"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ⚡ Checkout Response Messaging */}
          {orderStatus && (
            <p className={`mt-4 p-3 rounded-xl text-xs text-center font-semibold border ${
              orderStatus.startsWith("❌") 
                ? "bg-red-500/10 border-red-500/20 text-red-400" 
                : "bg-yellow-400/10 border-yellow-500/20 text-yellow-400 animate-pulse"
            }`}>
              {orderStatus}
            </p>
          )}

          {/* 🛍️ Functional Interactive Actions Layout */}
          <div className="mt-8 space-y-3">
            <button
              onClick={handleOrderSubmit}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300 font-black text-black tracking-wide shadow-lg hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer text-sm"
            >
              Secure Order Allocation
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full py-3 bg-neutral-950 border border-neutral-850 hover:bg-neutral-900 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              ← Back to Supply Lines
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}