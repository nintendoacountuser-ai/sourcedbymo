"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { useCart } from "@/app/context/CartContext";

interface DBProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  status: string;
  sizes: string[];
  size_prices: Record<string, number>;
  size_stock: Record<string, number>;
  description: string;
  shipping_type: "in_hand" | "import";
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();

  const [product, setProduct] = useState<DBProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        const prod = data as DBProduct;
        setProduct(prod);
        if (prod.sizes && prod.sizes.length > 0) {
          setSelectedSize(prod.sizes[0]);
        }
      }
      setLoading(false);
    }

    if (id) {
      void fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050507] text-white flex items-center justify-center">
        <p className="text-purple-400 font-mono text-xs animate-pulse">
          LOADING PRODUCT...
        </p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#050507] text-white flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">Product Not Found</h1>
        <Link
          href="/"
          className="px-4 py-2 bg-purple-600 rounded-xl text-xs font-bold"
        >
          Back to Shop
        </Link>
      </main>
    );
  }

  // Active Size Pricing
  const activeUnitPrice =
    selectedSize && product.size_prices?.[selectedSize]
      ? Number(product.size_prices[selectedSize])
      : Number(product.price);

  const totalPrice = activeUnitPrice * quantity;

  // Active Size Stock
  const isImport = product.shipping_type === "import";
  const activeStock = isImport
    ? 999
    : selectedSize
    ? Number(product.size_stock?.[selectedSize] ?? 0)
    : 0;

  const isSizeOutOfStock = activeStock <= 0;

  // Handlers
  const handleAddToCart = () => {
    if (isSizeOutOfStock) return;
    if (isImport && !termsAccepted) {
      setErrorMessage("Please accept terms before adding to cart.");
      return;
    }

    setErrorMessage("");
    addToCart({
      id: product.id,
      name: `${product.name} (${selectedSize || "Standard"})`,
      price: activeUnitPrice,
      image: product.image,
      selectedSize: selectedSize || "Standard",
      quantity: quantity,
    });

    setIsCartOpen(true);
  };

  const handleBuyNow = async () => {
    if (isSizeOutOfStock) return;
    if (isImport && !termsAccepted) {
      setErrorMessage("Please accept terms before proceeding.");
      return;
    }

    setCheckoutLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        productId: product.id,
        name: `${product.name} (${selectedSize || "Standard"})`,
        price: activeUnitPrice,
        image: product.image,
        quantity: quantity,
        size: selectedSize || "Standard",
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorMessage(data.error || "Failed to start checkout.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error initializing Stripe checkout.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Safe Image URL Parser
  const imageUrl =
    product.image && (product.image.startsWith("http") || product.image.startsWith("/"))
      ? product.image
      : product.image
      ? `/${product.image}`
      : "/images/placeholder.png";

  return (
    <main className="min-h-screen bg-[#050507] text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl relative">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-6 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-mono cursor-pointer"
        >
          ← Back to Shop
        </button>

        {/* Outer Container Matching Custom Purple Glow */}
        <div className="bg-[#0b0813] border border-purple-950/60 rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-[0_0_50px_rgba(112,26,117,0.2)]">

          {/* Left: Product Image Container */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-950 border border-purple-950/40 flex items-center justify-center">
        {product.image ? (
          <Image
            src={
              product.image.startsWith("http") || product.image.startsWith("/")
                ? product.image
                : `/${product.image}`
            }
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          /* Intentional Missing Image Design */
          <div className="flex flex-col items-center justify-center space-y-2 text-center p-4">
            <span className="text-2xl">🔒</span>
            <p className="text-xs font-black tracking-widest text-purple-400 uppercase">
              NO IMAGE AVAILABLE
            </p>
            <p className="text-[10px] text-neutral-500 font-mono">
              CONFIDENTIAL DROP
            </p>
          </div>
        )}
      </div>

          {/* Right: Info & Selectors */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              {/* Shipping Status Pill */}
              <div className="inline-block">
                <span
                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                    isImport
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                  }`}
                >
                  ✓ IN STOCK
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-black text-white mt-2">
                {product.name}
              </h1>

              {/* Size Selector Grid */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-5">
                  <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                    Select Size
                  </span>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {product.sizes.map((sz) => {
                      const szPrice = product.size_prices?.[sz] || product.price;
                      const szStock = isImport ? 999 : Number(product.size_stock?.[sz] ?? 0);
                      const isOut = szStock <= 0;

                      return (
                        <button
                          key={sz}
                          type="button"
                          disabled={isOut}
                          onClick={() => {
                            setSelectedSize(sz);
                            setQuantity(1);
                          }}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                            selectedSize === sz
                              ? "bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                              : isOut
                              ? "bg-neutral-950 border-neutral-900 text-neutral-600 cursor-not-allowed opacity-50"
                              : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-purple-800"
                          }`}
                        >
                          <span className="text-xs font-bold">{sz}</span>
                          <div className="flex items-center justify-between mt-1 text-[9px] font-mono">
                            <span>£{szPrice}</span>
                            {!isImport && (
                              <span className={szStock <= 3 ? "text-purple-400" : "text-neutral-500"}>
                                {szStock > 0 ? `${szStock}x left` : "Out"}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Picker */}
              <div className="mt-5">
                <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                  Quantity
                </span>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold font-mono">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= activeStock}
                      onClick={() =>
                        setQuantity((q) => Math.min(activeStock, q + 1))
                      }
                      className="px-3 py-1.5 text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {isSizeOutOfStock
                      ? "Out of stock"
                      : isImport
                      ? "Unlimited stock"
                      : `${activeStock} available`}
                  </span>
                </div>
              </div>

              {/* Import Disclaimer Box */}
              {isImport && (
                <div className="mt-4 p-3 bg-neutral-950 border border-amber-500/20 rounded-xl text-xs space-y-2">
                  <p className="font-bold text-amber-400 flex items-center gap-1.5">
                    ⚡ Notice of Announcement
                  </p>
                  <p className="text-[10px] text-neutral-400 leading-normal">
                    This item is not currently held in local physical inventory. Upon order creation, your order will be auto-sent and sourced directly.
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="accent-purple-500 rounded"
                    />
                    <span className="text-[10px] text-neutral-300 font-bold uppercase">
                      I understand and accept terms
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <p className="text-xs text-red-400 text-center font-bold bg-red-950/30 border border-red-500/20 p-2 rounded-xl">
                {errorMessage}
              </p>
            )}

            {/* Bottom Total & Buttons */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <span className="text-[10px] font-bold text-neutral-500 uppercase">
                  Total Price:
                </span>
                <span className="text-xl font-black text-white font-mono">
                  £{totalPrice.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isSizeOutOfStock}
                  onClick={handleAddToCart}
                  className="py-3 bg-neutral-950 border border-neutral-800 hover:border-purple-600 text-xs font-bold rounded-xl text-neutral-300 hover:text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ADD TO CART
                </button>
                <button
                  type="button"
                  disabled={isSizeOutOfStock || checkoutLoading}
                  onClick={handleBuyNow}
                  className="py-3 bg-purple-600 hover:bg-purple-500 text-xs font-bold rounded-xl text-white transition-all cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {checkoutLoading ? "CONNECTING..." : "BUY NOW"}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}