"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../lib/supabase";

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

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dbProducts, setDbProducts] = useState<DBProduct[]>([]);

  // Editing State Logic
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("shoes");
  const [status, setStatus] = useState("In Stock");
  const [shippingType, setShippingType] = useState<"in_hand" | "import">("in_hand");
  const [sizesInput, setSizesInput] = useState("");
  const [sizePricesInput, setSizePricesInput] = useState("");
  const [sizeStockInput, setSizeStockInput] = useState("");
  const [description, setDescription] = useState("");

  // Guard page and fetch active stock
  useEffect(() => {
    const isAdmin = localStorage.getItem("isMoAdmin");
    if (isAdmin !== "true") {
      router.push("/login");
    } else {
      void fetchCurrentInventory();
    }
  }, [router]);

  async function fetchCurrentInventory() {
    const { data, error } = await supabase.from("products").select("*");
    if (!error && data) {
      setDbProducts(data as DBProduct[]);
    }
    setAuthorized(true);
  }

  // Trigger Edit Mode (Populates form with selected item details)
  const handleEditTrigger = (product: DBProduct) => {
    setIsEditing(true);
    setId(product.id || "");
    setName(product.name || "");
    setPrice(
      product.price !== undefined && product.price !== null
        ? String(product.price)
        : ""
    );
    setImage(product.image || "");
    setCategory(product.category || "shoes");
    setStatus(product.status || "In Stock");
    setShippingType(product.shipping_type || "in_hand");
    setDescription(product.description || "");
    setSizesInput(product.sizes ? product.sizes.join(", ") : "");

    if (product.size_prices && Object.keys(product.size_prices).length > 0) {
      const pricePairs = Object.entries(product.size_prices).map(
        ([sz, pr]) => `${sz}:${pr}`
      );
      setSizePricesInput(pricePairs.join(", "));
    } else {
      setSizePricesInput("");
    }

    if (product.size_stock && Object.keys(product.size_stock).length > 0) {
      const stockPairs = Object.entries(product.size_stock).map(
        ([sz, st]) => `${sz}:${st}`
      );
      setSizeStockInput(stockPairs.join(", "));
    } else {
      setSizeStockInput("");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setId("");
    setName("");
    setPrice("");
    setImage("");
    setCategory("shoes");
    setStatus("In Stock");
    setShippingType("in_hand");
    setSizesInput("");
    setSizePricesInput("");
    setSizeStockInput("");
    setDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const sizesArray = sizesInput
      ? sizesInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const sizePricesMap: Record<string, number> = {};
    if (sizePricesInput) {
      sizePricesInput.split(",").forEach((pair) => {
        const [sizeKey, priceVal] = pair.split(":");
        if (sizeKey && priceVal) {
          sizePricesMap[sizeKey.trim()] = Number(priceVal.trim());
        }
      });
    }

    const sizeStockMap: Record<string, number> = {};
    if (sizeStockInput) {
      sizeStockInput.split(",").forEach((pair) => {
        const [sizeKey, stockVal] = pair.split(":");
        if (sizeKey && stockVal) {
          sizeStockMap[sizeKey.trim()] = Math.max(
            0,
            parseInt(stockVal.trim(), 10) || 0
          );
        }
      });
    } else {
      sizesArray.forEach((size) => {
        sizeStockMap[size] = 10;
      });
    }

    const payload = {
      name,
      price: price ? Number(price) : 0,
      image,
      category,
      status,
      shipping_type: shippingType,
      sizes: sizesArray,
      size_prices: sizePricesMap,
      size_stock: sizeStockMap,
      description,
    };

    if (isEditing) {
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", id);

      setLoading(false);
      if (error) {
        setMessage(`❌ Error updating product: ${error.message}`);
      } else {
        setMessage("✅ Product edits saved successfully to live database!");
        handleCancelEdit();
        fetchCurrentInventory();
      }
    } else {
      const { error } = await supabase
        .from("products")
        .insert([{ id, ...payload }]);

      setLoading(false);
      if (error) {
        setMessage(`❌ Error adding product: ${error.message}`);
      } else {
        setMessage("✅ Product successfully uploaded straight to the live database!");
        handleCancelEdit();
        fetchCurrentInventory();
      }
    }
  };

  const handleDeleteProduct = async (
    productId: string,
    productName: string
  ) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to completely remove "${productName}" from your shop?`
    );
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      setMessage(`❌ Failed to delete item: ${error.message}`);
    } else {
      setMessage(`🗑️ Removed "${productName}" successfully.`);
      if (isEditing && id === productId) {
        handleCancelEdit();
      }
      fetchCurrentInventory();
    }
  };

  if (!authorized) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f0a1c] via-[#050507] to-[#020203] text-white flex flex-col items-center p-6 space-y-8 selection:bg-purple-500 selection:text-white">
      {/* MANAGEMENT FORM CONTAINER */}
      <div className="w-full max-w-2xl bg-[#120f1a]/60 backdrop-blur-md border border-purple-950/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-between items-center border-b border-purple-950/20 pb-4 mb-6">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="px-4 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-bold text-gray-400 hover:text-purple-400 hover:border-purple-500/30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            ← Leave Workspace
          </button>
          <div className="flex items-center gap-2">
            {isEditing && (
              <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-md font-bold animate-pulse">
                EDIT MODE
              </span>
            )}
            <span className="text-xs font-mono tracking-widest text-neutral-600 uppercase">
              Secure Environment
            </span>
          </div>
        </div>

        <h1 className="text-3xl font-black text-gray-100 tracking-tight">
          {isEditing ? "Modify Stock Record" : "Catalog Management"}
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {isEditing
            ? `Modifying existing product configurations for ID: ${id}`
            : "Inject dynamic items straight into production inventory tables."}
        </p>

        {message && (
          <p className="mt-4 p-3 bg-neutral-950 border border-purple-950/20 rounded-xl text-center text-sm font-semibold text-purple-400 animate-pulse">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold tracking-wider text-purple-400/80 uppercase">
                Unique Web ID
              </label>
              <input
                type="text"
                value={id || ""}
                onChange={(e) => setId(e.target.value)}
                disabled={isEditing}
                placeholder="nike-dunk-grey"
                className={`w-full bg-neutral-950 border border-neutral-800 p-3 rounded-xl mt-1 text-sm focus:border-purple-500 outline-none transition-colors ${
                  isEditing
                    ? "text-neutral-500 cursor-not-allowed bg-neutral-900 border-neutral-800 focus:border-neutral-800"
                    : ""
                }`}
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold tracking-wider text-purple-400/80 uppercase">
                Display Name
              </label>
              <input
                type="text"
                value={name || ""}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nike Dunk Low Grey"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 p-3 rounded-xl mt-1 text-sm outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold tracking-wider text-purple-400/80 uppercase">
                Base Fallback Price
              </label>
              <input
                type="text"
                value={price || ""}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="140"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 p-3 rounded-xl mt-1 text-sm outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold tracking-wider text-purple-400/80 uppercase">
                Image Asset Path
              </label>
              <input
                type="text"
                value={image || ""}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/images/dunk.jpg"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 p-3 rounded-xl mt-1 text-sm outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold tracking-wider text-purple-400/80 uppercase">
                Category Allocation
              </label>
              <select
                value={category || "shoes"}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 p-3 rounded-xl mt-1 text-sm outline-none transition-colors text-gray-300"
              >
                <option value="shoes">Shoes</option>
                <option value="clothing">Clothing</option>
                <option value="jackets">Jackets</option>
                <option value="perfumes">Perfumes</option>
                <option value="tech">Tech</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold tracking-wider text-purple-400/80 uppercase">
                Stock Status
              </label>
              <select
                value={status || "In Stock"}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 p-3 rounded-xl mt-1 text-sm outline-none transition-colors text-gray-300"
              >
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Allocated / Sold">Allocated / Sold</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-wider text-purple-400/80 uppercase">
              Inventory Sourcing Line
            </label>
            <select
              value={shippingType}
              onChange={(e) =>
                setShippingType(e.target.value as "in_hand" | "import")
              }
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 p-3 rounded-xl mt-1 text-sm outline-none transition-colors text-gray-300"
            >
              <option value="in_hand">
                In Hand (Physically at house / Shipped instantly)
              </option>
              <option value="import">
                Global Import Line (Ordered on demand from China / 2+ weeks)
              </option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-wider text-purple-400/80 uppercase">
              Available Sizes (Separate with commas)
            </label>
            <input
              type="text"
              value={sizesInput || ""}
              onChange={(e) => setSizesInput(e.target.value)}
              placeholder="UK 8, UK 9, UK 10"
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 p-3 rounded-xl mt-1 text-sm outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-wider text-purple-400/80 uppercase">
              Custom Size Prices Matrix (Format → Size:Price, Size:Price)
            </label>
            <input
              type="text"
              value={sizePricesInput || ""}
              onChange={(e) => setSizePricesInput(e.target.value)}
              placeholder="UK 8:140, UK 9:160, UK 10:185"
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 p-3 rounded-xl mt-1 text-sm outline-none font-mono text-purple-300 transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-wider text-purple-400/80 uppercase">
              Custom Size Stocks Matrix (Format → Size:Stock, Size:Stock)
            </label>
            <input
              type="text"
              value={sizeStockInput || ""}
              onChange={(e) => setSizeStockInput(e.target.value)}
              placeholder="UK 8:12, UK 9:5, UK 10:0"
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 p-3 rounded-xl mt-1 text-sm outline-none font-mono text-purple-300 transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-wider text-purple-400/80 uppercase">
              Product Description Sheet
            </label>
            <textarea
              value={description || ""}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Provide premium item summary metrics..."
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-purple-500 p-3 rounded-xl mt-1 text-sm outline-none transition-colors"
            />
          </div>

          <div className="flex gap-4 pt-2">
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 rounded-xl bg-neutral-950 border border-neutral-800 font-bold text-gray-400 hover:text-white hover:border-purple-900 transition-all cursor-pointer text-sm"
              >
                Cancel / Back
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-purple-400 py-4 font-extrabold text-white tracking-wide shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
            >
              {loading
                ? "Writing To Live Tables..."
                : isEditing
                ? "Save Product Edits"
                : "Push New Stock Live"}
            </button>
          </div>
        </form>
      </div>

      {/* LIVE STOCK MANAGEMENT AREA */}
      <div className="w-full max-w-2xl bg-[#120f1a]/60 backdrop-blur-md border border-purple-950/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <h2 className="text-xl font-extrabold text-white">
          Live Catalog Status Log
        </h2>
        <p className="text-gray-500 text-xs mt-1">
          Review live catalog layout metadata and modify or strip stock lines out of database instantly.
        </p>

        <div className="mt-6 divide-y divide-purple-950/20 max-h-96 overflow-y-auto pr-2">
          {dbProducts.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">
              No catalog lines returned. Store is currently clear.
            </p>
          ) : (
            dbProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 relative rounded-xl bg-neutral-950 border border-purple-950/30 overflow-hidden shrink-0">
                    <Image
                      src={
                        product.image &&
                        (product.image.startsWith("http") ||
                          product.image.startsWith("/"))
                          ? product.image
                          : product.image
                          ? `/${product.image}`
                          : "/images/placeholder.png"
                      }
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-200">
                        {product.name}
                      </h3>
                      <span
                        className={`text-[8px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase ${
                          product.shipping_type === "import"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        }`}
                      >
                        {product.shipping_type === "import"
                          ? "China Import"
                          : "In Hand"}
                      </span>
                    </div>
                    <p className="text-xs text-purple-400 font-mono mt-0.5">
                      £{product.price} •{" "}
                      <span className="text-neutral-500 uppercase">
                        {product.category}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {product.sizes &&
                        product.sizes.map((size) => {
                          const stock = product.size_stock?.[size] ?? 0;
                          return (
                            <span
                              key={size}
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                product.shipping_type === "import"
                                  ? "bg-neutral-900 text-amber-400/80 border border-neutral-800"
                                  : stock <= 0
                                  ? "bg-red-500/10 text-red-400 border border-red-500/10"
                                  : "bg-neutral-900 text-gray-400 border border-neutral-800"
                              }`}
                            >
                              {size}:{" "}
                              {product.shipping_type === "import"
                                ? "∞"
                                : stock}
                            </span>
                          );
                        })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditTrigger(product)}
                    className="px-3 py-1.5 text-xs font-bold text-purple-400 bg-purple-500/5 border border-purple-500/10 rounded-xl hover:bg-purple-500/20 active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteProduct(product.id, product.name)
                    }
                    className="px-3 py-1.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Stealth Footer */}
      <footer className="w-full py-4 text-center select-none">
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