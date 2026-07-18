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

  // 🧠 Logic Strategy: Group items by category to maintain exactly 4 items per category on Home page
  const renderProductsList = () => {
    if (activeCategory !== "all") {
      const filtered = products.filter((p) => p.category === activeCategory);
      const inHand = filtered.filter((p) => p.shipping_type !== "import");
      const imports = filtered.filter((p) => p.shipping_type === "import");

      if (filtered.length === 0) return <EmptyState />;

      return (
        <div className="w-full space-y-12">
          {/* In Hand Section */}
          {inHand.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6 border-b border-purple-950/20 pb-2">
                <span className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                <h3 className="text-sm font-extrabold tracking-widest text-purple-400 uppercase">In Hand Stock (Instant Delivery)</h3>
              </div>
              <div className="w-full flex flex-wrap justify-start items-center gap-4 md:gap-8 max-w-5xl mx-auto px-2">
                {inHand.map((product) => (
                  <ProductItem key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}

          {/* Global Import Section */}
          {imports.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6 border-b border-amber-950/30 pb-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                <h3 className="text-sm font-extrabold tracking-widest text-amber-400 uppercase">Global Import Line (Sourced on Request • 2+ Weeks)</h3>
              </div>
              <div className="w-full flex flex-wrap justify-start items-center gap-4 md:gap-8 max-w-5xl mx-auto px-2">
                {imports.map((product) => (
                  <ProductItem key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // 🧠 Home View: Slice exactly 4 balanced products per active store category
    const categories = ["shoes", "clothing", "jackets", "perfumes", "tech"];
    const homeFeaturedProducts: any[] = [];

    categories.forEach((cat) => {
      const catProducts = products.filter((p) => p.category === cat).slice(0, 4);
      homeFeaturedProducts.push(...catProducts);
    });

    if (homeFeaturedProducts.length === 0) return <EmptyState />;

    return (
      <div className="w-full flex flex-wrap justify-center items-center gap-4 md:gap-8 max-w-5xl mx-auto px-2">
        {homeFeaturedProducts.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    );
  };

  const EmptyState = () => (
    <div className="text-center py-16 px-4 text-gray-500 bg-[#120f1a]/30 rounded-3xl border border-purple-950/40 max-w-md mx-auto w-full">
      <p className="text-lg font-medium text-gray-400">New stock arriving soon!</p>
      <button onClick={() => setActiveCategory("all")} className="mt-4 px-5 py-2 bg-neutral-950 text-purple-400 rounded-full border border-neutral-900 text-xs font-semibold hover:border-purple-800 transition-colors">
        Back to Home
      </button>
    </div>
  );

  const ProductItem = ({ product }: { product: any }) => (
    <div className="w-[calc(100%-12px)] sm:w-[220px] flex justify-center shrink-0 animate-fadeIn relative group">
      {/* Subtle top indicator corner badge for imports in standard listings */}
      {product.shipping_type === "import" && (
        <span className="absolute top-2 right-2 z-10 text-[8px] font-black tracking-widest uppercase bg-amber-500 text-black px-1.5 py-0.5 rounded shadow-md pointer-events-none">
          Import
        </span>
      )}
      <ProductCard id={product.id} name={product.name} price={product.price} image={product.image} />
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f0a1c] via-[#050507] to-[#020203] text-white flex flex-col justify-between selection:bg-purple-500 selection:text-white">

      <div>
        {/* 📱 Sticky Navbar themed to transparency mask matching your crown logo layout */}
        <nav className="flex flex-col sm:flex-row items-center justify-between px-4 md:px-12 py-4 md:py-6 relative z-50 border-b border-purple-950/20 bg-[#0d0a14]/60 backdrop-blur-lg sticky top-0 gap-4 sm:gap-0">

          <button onClick={() => setActiveCategory("all")} type="button" className="focus:outline-none cursor-pointer transform hover:scale-105 transition-transform duration-300">
            <img src="/images/logo.png" className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-neutral-950 p-1 object-contain border border-purple-900/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]" alt="SourcedByMo" />
          </button>

          <div className="flex gap-2 md:gap-4 font-medium items-center w-full sm:w-auto overflow-x-auto no-scrollbar justify-start sm:justify-end pb-2 sm:pb-0 px-2 sm:px-0">
            {navItems.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveCategory(item.value);
                }}
                className={`transition-all duration-300 cursor-pointer text-xs md:text-sm whitespace-nowrap py-1.5 px-3 rounded-xl focus:outline-none relative ${
                  activeCategory === item.value 
                    ? "text-white bg-purple-600 font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)]" 
                    : "text-gray-400 hover:text-white hover:bg-purple-950/40"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Home Banner Section */}
        {activeCategory === "all" && (
          <>
            <section className="px-6 py-16 md:py-24 max-w-6xl mx-auto flex flex-col items-center text-center animate-fadeIn relative">
              <div className="absolute top-10 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

              <img src="/images/logo.png" className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-neutral-950 p-2 mb-6 md:mb-8 object-contain border border-purple-900/40 shadow-[0_0_40px_rgba(168,85,247,0.2)] animate-scaleUp relative z-10" alt="SourcedByMo" />
              <h1 className="text-4xl md:text-7xl font-black leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-400 drop-shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                Premium Products<br />Better Prices
              </h1>
              <p className="mt-4 md:mt-6 text-base md:text-xl text-gray-400 max-w-2xl px-2">
                Discover authentic footwear, clothing, fragrances and tech straight from SourcedByMo.
              </p>
              <a href="#collection-grid" className="scroll-smooth">
                <button className="mt-6 md:mt-8 rounded-full bg-gradient-to-r from-purple-600 to-violet-400 px-8 md:px-10 py-3.5 md:py-4 font-bold text-white shadow-lg hover:shadow-purple-500/20 hover:scale-105 active:scale-98 transition-all duration-300 cursor-pointer">
                  Browse Live Stock
                </button>
              </a>
            </section>

            {/* Feature Cards Showcase */}
            <section className="px-4 md:px-12 py-12 md:py-20 bg-[#0c0914]/40 border-y border-purple-950/20">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6">
                <Card title="🔥 Premium Supplier" text="Best quality and best prices products maximizing your profits." />
                <Card title="📈 Growth Guides" text="Learn strategies to improve your reselling business." />
                <Card title="💎 Exclusive Community" text="Connect with other ambitious resellers." />
              </div>
            </section>
          </>
        )}

        {/* Dynamic Display Grid */}
        <section id="collection-grid" className="px-4 md:px-12 py-12 md:py-16 max-w-6xl mx-auto min-h-[40vh] flex flex-col items-center">
          <h2 className="mb-8 md:mb-12 text-3xl md:text-4xl font-extrabold text-center capitalize tracking-tight w-full">
            {activeCategory === "all" ? "Featured Products" : `${activeCategory} Collection`}
          </h2>

          {loading ? (
            <div className="text-center py-20 text-gray-400 w-full">
              <p className="text-sm font-medium animate-pulse tracking-widest uppercase text-purple-400/70">Syncing store database...</p>
            </div>
          ) : (
            renderProductsList()
          )}
        </section>
      </div>

      {/* Footer System Lines */}
      <footer className="w-full border-t border-purple-950/20 bg-black/40 pt-10 pb-6 px-4 md:px-12 text-center mt-auto">
        <div className="max-w-md mx-auto mb-8">
          <h3 className="text-xs font-bold tracking-widest uppercase text-purple-400/60 mb-3.5">Connect With Supply Lines</h3>

          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <a href="https://wa.me/447000000000" target="_blank" rel="noopener noreferrer" className="px-2 py-2.5 rounded-xl bg-neutral-950 border border-neutral-850 hover:border-purple-500/30 text-[11px] md:text-xs font-bold text-gray-400 hover:text-purple-400 transition-all duration-300 shadow-sm">
              💬 WhatsApp
            </a>
            <a href="tel:+447000000000" className="px-2 py-2.5 rounded-xl bg-neutral-950 border border-neutral-850 hover:border-purple-500/30 text-[11px] md:text-xs font-bold text-gray-400 hover:text-purple-400 transition-all duration-300 shadow-sm">
              📞 Call Lines
            </a>
            <a href="mailto:contact@sourcedbymo.com" className="px-2 py-2.5 rounded-xl bg-neutral-950 border border-neutral-850 hover:border-purple-500/30 text-[11px] md:text-xs font-bold text-gray-400 hover:text-purple-400 transition-all duration-300 shadow-sm">
              ✉️ Email Mo
            </a>
          </div>
        </div>

        <p className="text-[11px] text-neutral-600">© {new Date().getFullYear()} SourcedByMo. All Rights Reserved.</p>
        <p className="mt-1 text-[9px] text-neutral-950 select-none">
          Powered by digital catalog networks.{" "}
          <Link href="/login" className="text-neutral-950 hover:text-neutral-950 cursor-default default-pointer">
            sys-auth
          </Link>
        </p>
      </footer>

    </main>
  );
}

function Card({title, text}: {title:string, text:string}) {
  return (
    <div className="w-full sm:w-72 rounded-2xl bg-[#120f1a]/30 backdrop-blur-sm p-6 md:p-8 border border-purple-950/30 text-center transform hover:-translate-y-1 transition-transform duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.05)]">
      <h3 className="text-lg md:text-xl font-bold tracking-tight text-gray-100">{title}</h3>
      <p className="mt-2 md:mt-4 text-gray-400 leading-relaxed text-xs md:text-sm">{text}</p>
    </div>
  );
}