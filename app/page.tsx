"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "./components/ProductCard";
import { supabase } from "./lib/supabase";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase.from("products").select("*").limit(4);
      if (data) setFeaturedProducts(data as Product[]);
    }
    void fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-linear-to-b from-[#0f0a1c] via-[#050507] to-[#020203] text-white flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      <div>
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between px-4 md:px-12 py-4 md:py-6 z-50 border-b border-purple-950/20 bg-[#0d0a14]/60 backdrop-blur-lg sticky top-0">
          <Link href="/" className="focus:outline-none cursor-pointer relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden bg-neutral-950 p-1 border border-purple-900/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <Image src="/images/logo.png" fill sizes="(max-w-768px) 64px, 48px" className="object-contain p-1" alt="SourcedByMo" priority />
          </Link>

          <Link href="/shop" className="text-xs md:text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-xl transition-all shadow-[0_0_12px_rgba(168,85,247,0.35)]">
            Shop Store ➔
          </Link>
        </nav>

        {/* Hero Banner */}
        <section className="px-6 py-16 md:py-24 max-w-6xl mx-auto flex flex-col items-center text-center relative">
          <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-neutral-950 p-2 mb-6 border border-purple-900/40 shadow-[0_0_40px_rgba(168,85,247,0.2)] relative z-10 overflow-hidden">
            <Image src="/images/logo.png" fill sizes="(max-w-768px) 176px, 128px" className="object-contain p-2" alt="SourcedByMo" priority />
          </div>

          <h1 className="text-4xl md:text-7xl font-black leading-tight bg-clip-text text-transparent bg-linear-to-r from-white via-purple-100 to-purple-400">
            Premium Products<br />Better Prices
          </h1>
          <p className="mt-4 text-base md:text-xl text-gray-400 max-w-2xl px-2">
            Discover authentic footwear, clothing, fragrances and tech straight from SourcedByMo.
          </p>

          <Link href="/shop" className="mt-8 rounded-full bg-linear-to-r from-purple-600 to-violet-400 px-8 py-4 font-bold text-white shadow-lg hover:scale-105 transition-all">
            Browse All Stock
          </Link>
        </section>

        {/* Featured Drops Teaser */}
        {featuredProducts.length > 0 && (
          <section className="px-4 md:px-12 py-12 max-w-5xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-8">Latest Drops</h2>
            <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6 mb-10">
              {featuredProducts.map((product) => (
                <div key={product.id} className="w-[calc(50%-6px)] sm:w-[220px]">
                  <ProductCard id={product.id} name={product.name} price={product.price} image={product.image} />
                </div>
              ))}
            </div>

            {/* View Full Collection Button */}
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-neutral-900 border border-purple-900/50 hover:border-purple-500 text-purple-300 hover:text-white text-xs md:text-sm font-bold tracking-wide transition-all duration-300 shadow-lg hover:shadow-purple-500/20 hover:scale-105"
            >
              View Full Collection ➔
            </Link>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-purple-950/20 bg-black/40 pt-10 pb-6 px-4 md:px-12 text-center mt-auto">
        <p className="text-[11px] text-neutral-600">© {new Date().getFullYear()} SourcedByMo. All Rights Reserved.</p>
      </footer>
    </main>
  );
}