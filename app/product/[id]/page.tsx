"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // 💜 Imported optimized image element
import { supabase } from "../../lib/supabase";

// Define strict types for our product object to satisfy ESLint
interface ProductData {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  status?: string;
  sizes?: string[];
  size_prices?: Record<string, string | number>;
  size_stock?: Record<string, number>; // 💜 Added size stock type mapping
  description?: string;
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  // 💜 Fixed: Typed state properly instead of using 'any'
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);

  // Helper: Fetch remaining stock for a size safely
  const getStockForSize = (p: ProductData, size: string): number => {
    if (p.size_stock && p.size_stock[size] !== undefined) {
      return Number(p.size_stock[size]);
    }
    return 0; // Default to 0 if not defined in Supabase yet
  };

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (!error && data) {
        const fetchedProduct = data as ProductData;
        setProduct(fetchedProduct);

        if (fetchedProduct.sizes && fetchedProduct.sizes.length > 0) {
          // 💜 UX Fix: Automatically select the first size that has stock available
          const firstInStockSize = fetchedProduct.sizes.find(
            (size) => getStockForSize(fetchedProduct, size) > 0
          );
          setSelectedSize(firstInStockSize || fetchedProduct.sizes[0]);
        }
      }
      setLoading(false);
    }

    // 💜 Fixed: 'void' explicitly tells TypeScript that the floating promise is handled safely
    void fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <p className="text-sm font-medium animate-pulse tracking-widest text-purple-400">Loading Asset Data...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <p className="text-sm text-gray-500">Asset record not found.</p>
      </div>
    );
  }

  // Helper mapping helper exposed to outer component render context
  const currentStockForSize = selectedSize ? getStockForSize(product, selectedSize) : 0;

  const getPriceForSize = (size: string): number => {
    if (product.size_prices && product.size_prices[size]) {
      return Number(product.size_prices[size]);
    }
    return Number(product.price);
  };

  const currentUnitPrice = getPriceForSize(selectedSize);
  const totalPrice = currentUnitPrice * quantity;

  // 💜 Check current selected item stock status
  const isOutOfStock = currentStockForSize <= 0;

  // 💜 Safe Size Selection: Resets quantity logic to max available stock bounds
  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    const newSizeStock = getStockForSize(product, size);
    if (newSizeStock > 0) {
      setQuantity(1); // Reset purchase count to 1 safely
    } else {
      setQuantity(0);
    }
  };

  const handleCheckout = async () => {
    if (isOutOfStock) return;
    setCheckoutLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          name: `${product.name} (${selectedSize})`,
          price: currentUnitPrice,
          image: product.image,
          quantity: quantity,
          size: selectedSize
        }),
      });

      const resData = await response.json();
      if (resData.url) {
        window.location.href = resData.url;
      } else {
        alert(`Checkout failed: ${resData.error || "Unknown routing failure"}`);
      }
    } catch (err) {
      // 💜 Fixed: Safe structural validation check for runtime errors without using 'any'
      const msg = err instanceof Error ? err.message : "Internal system crash context";
      console.error(msg);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    // 💜 Fixed: Converted to Tailwind v4 class 'bg-linear-to-b'
    <main className="min-h-screen bg-linear-to-b from-[#0f0a1c] via-[#050507] to-[#020203] text-white px-4 py-12 md:py-24 flex flex-col items-center justify-center space-y-4">

      <div className="max-w-4xl w-full flex justify-start">
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 rounded-xl bg-[#120f1a]/60 border border-purple-950/40 text-xs font-bold text-gray-400 hover:text-purple-400 transition-all cursor-pointer"
        >
          ← Back to Shop
        </button>
      </div>

      <div className="max-w-4xl w-full bg-[#120f1a]/40 backdrop-blur-md border border-purple-950/30 rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl">

        {/* Left Column: Fixed layout wrapper with Next.js optimized <Image /> element instead of <img> */}
        <div className="aspect-square bg-neutral-950 rounded-2xl border border-purple-950/20 flex items-center justify-center p-4 relative overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-w-768px) 100vw, 50vw"
            priority
            className="object-contain object-center p-4"
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20 text-purple-400">
              {product.status || "Secure Line"}
            </span>
            <h1 className="text-2xl md:text-3xl font-black mt-3 text-gray-100 tracking-tight">{product.name}</h1>
            <p className="mt-4 text-xs md:text-sm text-gray-400 leading-relaxed">{product.description || "No supplemental metrics declared."}</p>

            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-6">
                <label className="text-[10px] font-bold tracking-wider text-purple-400/80 uppercase block mb-2">Select Size</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string) => {
                    const stock = getStockForSize(product, size);
                    const outOfStock = stock <= 0;

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeChange(size)}
                        className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all flex flex-col items-center justify-center min-w-[70px] cursor-pointer ${
                          outOfStock
                            ? "bg-neutral-950/30 border-neutral-950 text-neutral-600 cursor-not-allowed opacity-50"
                            : selectedSize === size
                              ? "bg-purple-600 text-white border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                              : "bg-neutral-950 text-gray-400 border-neutral-900 hover:text-white hover:border-purple-950"
                        }`}
                      >
                        <span>{size} {product.size_prices && product.size_prices[size] && `(£${product.size_prices[size]})`}</span>
                        <span className={`text-[8px] font-semibold mt-0.5 uppercase tracking-wide ${
                          outOfStock ? "text-red-500" : "text-purple-400/70"
                        }`}>
                          {outOfStock ? "Out of Stock" : `${stock} left`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6">
              <label className="text-[10px] font-bold tracking-wider text-purple-400/80 uppercase block mb-2">Quantity</label>
              <div className="flex items-center gap-3 bg-neutral-950 border border-neutral-900 w-max p-1 rounded-xl">
                <button
                  type="button"
                  disabled={isOutOfStock || quantity <= 1}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center font-bold text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className={`w-8 text-center text-xs font-mono font-bold ${isOutOfStock ? "text-gray-600" : "text-gray-200"}`}>
                  {isOutOfStock ? 0 : quantity}
                </span>
                <button
                  type="button"
                  disabled={isOutOfStock || quantity >= currentStockForSize}
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center font-bold text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-purple-950/20">
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-xs text-neutral-500 font-medium">Total Price:</span>
              <span className="text-2xl font-black text-purple-400">
                {isOutOfStock ? "£0" : `£${totalPrice}`}
              </span>
            </div>

            {/* 💜 Fixed: Converted to Tailwind v4 class 'bg-linear-to-r' & supports active stock checking */}
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading || isOutOfStock}
              className={`w-full py-4 font-extrabold text-xs tracking-wider uppercase rounded-xl text-white transition-all cursor-pointer ${
                isOutOfStock
                  ? "bg-neutral-950 text-neutral-600 border border-neutral-900 cursor-not-allowed opacity-50"
                  : "bg-linear-to-r from-purple-600 to-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
              }`}
            >
              {checkoutLoading
                ? "Acquiring Secure Session..."
                : isOutOfStock
                  ? "Selected Size Out of Stock"
                  : "Secure Order Line"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}