"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { supabase } from "../../lib/supabase";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  shipping_type?: "in_hand" | "import";
  sizes?: string[];
  size_prices?: Record<string, number>;
  size_stock?: Record<string, number>;
  stock?: number;
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);

  const { addToCart, setIsCartOpen, totalItems } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (!error && data) {
          const prod = data as Product;
          setProduct(prod);
          if (prod.sizes && prod.sizes.length > 0) {
            setSelectedSize(prod.sizes[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    }
    void fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center">
        <p className="text-sm font-medium animate-pulse tracking-widest uppercase text-purple-400">
          Loading product...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold">Product Not Found</h2>
        <Link href="/shop" className="text-xs text-purple-400 underline">
          ← Back to Shop
        </Link>
      </div>
    );
  }

  const isImport = product.shipping_type === "import";

  const unitPrice =
    selectedSize && product.size_prices && product.size_prices[selectedSize] !== undefined
      ? Number(product.size_prices[selectedSize])
      : Number(product.price);

  const totalPrice = unitPrice * quantity;

  const maxStock = isImport
    ? 99
    : selectedSize && product.size_stock && product.size_stock[selectedSize] !== undefined
    ? Number(product.size_stock[selectedSize])
    : Number(product.stock ?? 0);

  const isOutOfStock = !isImport && maxStock <= 0;

  const safeImageUrl =
    product.image && (product.image.startsWith("http") || product.image.startsWith("/"))
      ? product.image
      : product.image
      ? `/${product.image}`
      : "/images/placeholder.png";

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    // Pass item with the explicit selected quantity once
    addToCart({
      id: product.id,
      name: product.name,
      price: unitPrice,
      image: safeImageUrl,
      selectedSize,
      quantity,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setIsCartOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#050507] text-white flex flex-col justify-between selection:bg-purple-500">
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-4 md:px-12 py-4 z-50 border-b border-purple-950/20 bg-[#0d0a14]/60 backdrop-blur-lg sticky top-0 w-full">
        <Link href="/shop" className="text-xs font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Shop
        </Link>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 hover:border-purple-500 transition-all text-white cursor-pointer"
        >
          <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-purple-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">
              {totalItems}
            </span>
          )}
        </button>
      </nav>

      {/* Perfectly Vertically & Horizontally Centered Content Box */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <section className="w-full max-w-4xl bg-[#0b0813] border border-purple-900/40 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(168,85,247,0.12)] grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">

          {/* Left: Image Container */}
          <div className="md:col-span-5 w-full aspect-square relative rounded-2xl bg-neutral-950 overflow-hidden border border-purple-950/60">
            <Image
              src={safeImageUrl}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Right: Details & Options */}
          <div className="md:col-span-7 flex flex-col gap-4">

            {/* Status Badge & Title */}
            <div>
              {isImport ? (
                <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 mb-2">
                  <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  GLOBAL IMPORT LINE (2+ WEEKS)
                </span>
              ) : (
                <span className="text-[10px] font-black tracking-widest uppercase text-purple-300 bg-purple-950/40 border border-purple-800/40 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 mb-2">
                  <svg className="w-3 h-3 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  IN STOCK
                </span>
              )}
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{product.name}</h1>
            </div>

            {/* Size Buttons */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Select Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {product.sizes.map((size) => {
                    const priceForSize = product.size_prices?.[size] ?? product.price;
                    const stockForSize = isImport ? undefined : product.size_stock?.[size];
                    const isSelected = selectedSize === size;

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setSelectedSize(size);
                          setQuantity(1);
                        }}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-purple-600 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.35)]"
                            : "bg-neutral-950/80 border-purple-950/50 text-gray-300 hover:border-purple-800"
                        }`}
                      >
                        <span className="text-xs font-bold">{size}</span>
                        <div className="flex justify-between items-center mt-1">
                          <span className={`text-[10px] ${isSelected ? "text-purple-100" : "text-purple-400"} font-extrabold`}>
                            £{priceForSize}
                          </span>
                          {stockForSize !== undefined && (
                            <span className={`text-[9px] ${stockForSize > 0 ? "text-emerald-400" : "text-red-400"} font-semibold`}>
                              {stockForSize > 0 ? `${stockForSize} left` : "Out"}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-neutral-950 border border-purple-950/60 rounded-xl overflow-hidden p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-purple-950/40 text-purple-300 hover:bg-purple-900/60 transition-colors disabled:opacity-40 cursor-pointer text-xs"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-extrabold text-xs text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                    disabled={quantity >= maxStock || isOutOfStock}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-purple-950/40 text-purple-300 hover:bg-purple-900/60 transition-colors disabled:opacity-40 cursor-pointer text-xs"
                  >
                    +
                  </button>
                </div>

                {!isImport && (
                  <span className="text-[11px] font-semibold text-gray-400">
                    {maxStock > 0 ? `${maxStock} left` : "Out of stock"}
                  </span>
                )}
              </div>
            </div>

            {/* Import Notice */}
            {isImport && (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 text-[11px]">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Notice of Announcement</span>
                </div>
                <p className="text-[10px] leading-relaxed text-amber-200/80">
                  This item is not currently held in local physical inventory. Upon order confirmation, your order will be sent and sourced directly.
                </p>
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="rounded border-amber-700 bg-black text-amber-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-[9px] uppercase font-bold tracking-wider text-amber-300">
                    I understand and accept terms
                  </span>
                </label>
              </div>
            )}

            {/* Footer / Buy Buttons */}
            <div className="border-t border-purple-950/30 pt-3 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Price:</span>
                <span className="text-xl font-black text-purple-300">£{totalPrice.toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || (isImport && !agreedToTerms)}
                  className="py-3 rounded-xl bg-neutral-950 border border-purple-900/50 hover:border-purple-500 text-purple-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add To Cart
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock || (isImport && !agreedToTerms)}
                  className="py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-600/30 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isImport ? "Acknowledge Notice to Proceed" : "Buy Now"}
                </button>
              </div>
            </div>

          </div>
        </section>
      </div>

      {/* Stealth Footer Link */}
      <footer className="w-full border-t border-purple-950/20 bg-black/40 py-6 px-4 text-center select-none">
        <p className="text-[11px] text-neutral-600">
          © {new Date().getFullYear()} SourcedByMo. All Rights Reserved.
        </p>
        <div className="mt-1">
          <Link
            href="/login"
            className="text-[10px] text-[#050507] hover:text-neutral-700 transition-colors cursor-default"
          >
            Admin Panel
          </Link>
        </div>
      </footer>
    </main>
  );
}