"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "./components/ProductCard";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase.from("products").select("*");
        if (!error && data) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Error fetching live storage:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const navItems = [
    { label: "Home", value: "all" },
    { label: "Shoes", value: "shoes" },
    { label: "Clothing", value: "clothing" },
    { label: "Jackets", value: "jackets" },
    { label: "Perfumes", value: "perfumes" },
    { label: "Tech", value: "tech" },
  ];

  const filteredProducts = activeCategory === "all"
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2a2a2a] via-[#111] to-[#050505] text-white transition-all duration-500 flex flex-col justify-between">

      <div>
        {/* Premium Navigation Bar */}
        <nav className="flex items-center justify-between px-6 md:px-12 py-6 relative z-50 border-b border-neutral-900/50 bg-[#1e1e1e]/40 backdrop-blur-md sticky top-0">
          <button onClick={() => setActiveCategory("all")} type="button" className="focus:outline-none cursor-pointer">
            <img src="/images/logo.png" className="w-16 h-16 rounded-full bg-[#111] p-2 object-contain border border-neutral-800" alt="SourcedByMo" />
          </button>

          <div className="flex gap-4 md:gap-6 font-semibold items-center">
            {navItems.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveCategory(item.value);
                }}
                className={`transition-colors cursor-pointer text-sm md:text-base py-2 px-1 focus:outline-none relative ${
                  activeCategory === item.value ? "text-yellow-400 font-bold" : "text-white hover:text-yellow-400"
                }`}
              >
                {item.label}
                {activeCategory === item.value && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-yellow-400 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Home Overview Content Hero Headers */}
        {activeCategory === "all" && (
          <>
            <section className="px-6 md:px-12 py-24 max-w-6xl mx-auto flex flex-col items-center text-center">
              <img src="/images/logo.png" className="w-44 h-44 rounded-full bg-[#111] p-4 mb-8 object-contain border border-neutral-800 shadow-xl" alt="SourcedByMo" />
              <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">Premium Products<br />Better Prices</h1>
              <p className="mt-6 text-xl text-gray-400 max-w-2xl">Discover authentic footwear, clothing, fragrances and tech straight from SourcedByMo.</p>
              <a href="#collection-grid">
                <button className="mt-8 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-300 px-10 py-4 font-bold text-black shadow-lg hover:scale-105 transition-all cursor-pointer">Browse Live Stock</button>
              </a>
            </section>

            <section className="px-6 md:px-12 py-20 bg-[#0a0a0a]/50 border-y border-neutral-900/30">
              <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6">
                <Card title="🔥 Premium supplier" text="Best quality and best prices products maximizing your profits." />
                <Card title="📈 Growth Guides" text="Learn strategies to improve your reselling business." />
                <Card title="💎 Exclusive Community" text="Connect with other ambitious resellers." />
              </div>
            </section>
          </>
        )}

        {/* Dynamic Display Grid */}
        <section id="collection-grid" className="px-6 md:px-12 py-16 max-w-6xl mx-auto min-h-[40vh]">
          <h2 className="mb-10 text-4xl font-bold text-center capitalize tracking-tight">{activeCategory === "all" ? "Featured Products" : `${activeCategory} Collection`}</h2>
          {loading ? (
            <div className="text-center py-20 text-gray-400"><p className="text-lg font-medium animate-pulse">Syncing store database...</p></div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-500 bg-[#111]/30 rounded-3xl border border-neutral-900">
              <p className="text-xl font-medium">New stock arriving soon!</p>
              <button onClick={() => setActiveCategory("all")} className="mt-6 px-6 py-2 bg-neutral-900 text-yellow-400 rounded-full border border-neutral-800 text-sm font-semibold">Back to Home</button>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} id={product.id} name={product.name} price={product.price} image={product.image} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 📞 PREMIUM CONTACT & STEALTH FOOTER PANEL */}
      <footer className="w-full border-t border-neutral-900/60 bg-black/40 pt-12 pb-8 px-6 md:px-12 text-center mt-auto">

        {/* Contact Hub Action Row */}
        <div className="max-w-md mx-auto mb-8">
          <h3 className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-4">Connect With Supply Lines</h3>

          <div className="grid grid-cols-3 gap-3">
            {/* WhatsApp Deep Link (Update with your phone number string) */}
            <a
              href="https://wa.me/447000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-850 hover:border-green-500/40 text-xs font-bold text-gray-300 hover:text-green-400 transition-all cursor-pointer shadow-sm"
            >
              💬 WhatsApp
            </a>

            {/* Direct Phone Line Dial Trigger */}
            <a
              href="tel:+447000000000"
              className="px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-850 hover:border-yellow-500/40 text-xs font-bold text-gray-300 hover:text-yellow-400 transition-all cursor-pointer shadow-sm"
            >
              📞 Call Lines
            </a>

            {/* Native Email Protocol Launch */}
            <a
              href="mailto:contact@sourcedbymo.com"
              className="px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-850 hover:border-blue-500/40 text-xs font-bold text-gray-300 hover:text-blue-400 transition-all cursor-pointer shadow-sm"
            >
              ✉️ Email Mo
            </a>
          </div>
        </div>

        <p className="text-xs text-neutral-600">© {new Date().getFullYear()} SourcedByMo. All Rights Reserved.</p>

        {/* Invisible backdoor login panel linkage anchor points */}
        <p className="mt-1 text-[10px] text-neutral-900 select-none">
          Powered by digital catalog networks.{" "}
          <Link href="/login" className="text-neutral-900 hover:text-neutral-900 cursor-default default-pointer">
            sys-auth
          </Link>
        </p>
      </footer>

    </main>
  );
}

function Card({title, text}: {title:string, text:string}) {
  return (
    <div className="w-72 rounded-2xl bg-[#111] p-8 border border-neutral-900 text-center">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-4 text-gray-400 leading-relaxed text-sm">{text}</p>
    </div>
  );
}