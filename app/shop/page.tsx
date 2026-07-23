"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  shipping_type?: "in_hand" | "import";
}

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [shippingSort, setShippingSort] = useState<"all" | "in_hand" | "import">("all");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { totalItems, setIsCartOpen } = useCart();
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase.from("products").select("*");
        if (!error && data) {
          setProducts(data as Product[]);
        }
      } catch (err) {
        console.error("Error fetching live storage:", err);
      } finally {
        setLoading(false);
      }
    }
    void fetchProducts();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { label: "All Items", value: "all" },
    { label: "Shoes", value: "shoes" },
    { label: "Clothing", value: "clothing" },
    { label: "Jackets", value: "jackets" },
    { label: "Perfumes", value: "perfumes" },
    { label: "Tech", value: "tech" },
  ];

  const filterLabels = {
    all: "All Stock",
    in_hand: "In Hand Stock",
    import: "Import Line",
  };

  const getFilteredProducts = () => {
    let list = products;
    if (activeCategory !== "all") {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (shippingSort === "in_hand") {
      list = list.filter((p) => p.shipping_type !== "import");
    } else if (shippingSort === "import") {
      list = list.filter((p) => p.shipping_type === "import");
    }
    return list;
  };

  const filteredProducts = getFilteredProducts();

  return (
    <main className="min-h-screen bg-linear-to-b from-[#0f0a1c] via-[#050507] to-[#020203] text-white flex flex-col justify-between selection:bg-purple-500">
      <div>
        {/* Navbar with Logo & Cart */}
        <nav className="flex items-center justify-between px-4 md:px-12 py-4 z-50 border-b border-purple-950/20 bg-[#0d0a14]/60 backdrop-blur-lg sticky top-0">
          <Link href="/" className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden bg-neutral-950 p-1 border border-purple-900/40">
            <Image src="/images/logo.png" fill sizes="(max-w-768px) 56px, 48px" className="object-contain p-1" alt="SourcedByMo" priority />
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs md:text-sm font-semibold text-gray-400 hover:text-white transition-colors">
              Home
            </Link>

            {/* Cart Button */}
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
          </div>
        </nav>

        {/* Shop Container */}
        <section className="px-4 md:px-12 pt-6 pb-12 max-w-5xl mx-auto w-full">

          {/* Toolbar: 2-Line Menu Button (Left) & Active Filter */}
          <div className="flex items-center justify-between border-b border-purple-950/20 pb-4 mb-6">
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#0d0a14] border border-purple-900/40 text-gray-200 hover:text-white hover:border-purple-600 transition-all cursor-pointer focus:outline-none"
              >
                {/* Clean 2-Line Menu Icon (matches your screenshot) */}
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8h16M4 16h16" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wider">
                  {filterLabels[shippingSort]}
                </span>
              </button>

              {/* Filter Dropdown */}
              {isFilterOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-xl bg-[#0d0a14] border border-purple-900/50 shadow-2xl p-1.5 flex flex-col gap-1 backdrop-blur-xl z-50">
                  <button
                    type="button"
                    onClick={() => { setShippingSort("all"); setIsFilterOpen(false); }}
                    className={`text-left px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer ${shippingSort === "all" ? "bg-purple-600 text-white font-bold" : "text-gray-300 hover:bg-purple-950/40"}`}
                  >
                    All Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShippingSort("in_hand"); setIsFilterOpen(false); }}
                    className={`text-left px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer ${shippingSort === "in_hand" ? "bg-purple-600 text-white font-bold" : "text-gray-300 hover:bg-purple-950/40"}`}
                  >
                    In Hand Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShippingSort("import"); setIsFilterOpen(false); }}
                    className={`text-left px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer ${shippingSort === "import" ? "bg-purple-600 text-white font-bold" : "text-gray-300 hover:bg-purple-950/40"}`}
                  >
                    Import Line
                  </button>
                </div>
              )}
            </div>

            <span className="text-xs font-semibold text-gray-400">
              {filteredProducts.length} Items
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-6">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => setActiveCategory(item.value)}
                className={`transition-all duration-300 cursor-pointer text-xs whitespace-nowrap py-2 px-3.5 rounded-xl border ${
                  activeCategory === item.value
                    ? "bg-purple-600 border-purple-500 text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                    : "bg-neutral-950/60 border-purple-950/40 text-gray-400 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Clean Clean Product Grid (No extra clutter under cards) */}
          {loading ? (
            <div className="text-center py-20 text-gray-400 w-full">
              <p className="text-sm font-medium animate-pulse tracking-widest uppercase text-purple-400/70">Loading catalog...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 px-4 text-gray-500 bg-[#120f1a]/30 rounded-3xl border border-purple-950/40 max-w-md mx-auto w-full">
              <p className="text-lg font-medium text-gray-400">No items match your selection.</p>
              <button onClick={() => { setActiveCategory("all"); setShippingSort("all"); }} className="mt-4 px-5 py-2 bg-neutral-950 text-purple-400 rounded-full border border-neutral-900 text-xs font-semibold hover:border-purple-800 cursor-pointer">
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-wrap justify-center items-center gap-3 md:gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="w-[calc(50%-6px)] sm:w-[220px] flex justify-center shrink-0 relative group">
                  {product.shipping_type === "import" && (
                    <span className="absolute top-2 right-2 z-10 text-[8px] font-black tracking-widest uppercase bg-amber-500 text-black px-1.5 py-0.5 rounded shadow-md pointer-events-none">
                      Import
                    </span>
                  )}
                  <ProductCard id={product.id} name={product.name} price={product.price} image={product.image} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-purple-950/20 bg-black/40 pt-8 pb-6 px-4 md:px-12 text-center mt-auto">
        <p className="text-[11px] text-neutral-600">© {new Date().getFullYear()} SourcedByMo. All Rights Reserved.</p>
      </footer>
    </main>
  );
}