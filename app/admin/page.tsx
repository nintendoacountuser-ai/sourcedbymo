"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dbProducts, setDbProducts] = useState<any[]>([]);

  // 🔄 Editing State Logic
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("shoes");
  const [status, setStatus] = useState("In Stock");
  const [sizesInput, setSizesInput] = useState("");
  const [description, setDescription] = useState("");

  // Guard page and fetch active stock
  useEffect(() => {
    const isAdmin = localStorage.getItem("isMoAdmin");
    if (isAdmin !== "true") {
      router.push("/login");
    } else {
      fetchCurrentInventory();
    }
  }, [router]);

  async function fetchCurrentInventory() {
    const { data, error } = await supabase.from("products").select("*");
    if (!error && data) {
      setDbProducts(data);
    }
  }

  // 📝 Trigger Edit Mode (Populates form with selected item details)
  const handleEditTrigger = (product: any) => {
    setIsEditing(true);
    setId(product.id);
    setName(product.name);
    setPrice(product.price);
    setImage(product.image);
    setCategory(product.category);
    setStatus(product.status);
    setSizesInput(product.sizes ? product.sizes.join(", ") : "");
    setDescription(product.description || "");

    // Smoothly scroll straight back to the top form layout
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ❌ Cancel Editing Back Button Logic
  const handleCancelEdit = () => {
    setIsEditing(false);
    setId(""); setName(""); setPrice(""); setImage(""); setSizesInput(""); setDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const sizesArray = sizesInput ? sizesInput.split(",").map(s => s.trim()) : [];

    if (isEditing) {
      // 🛠️ UPDATE Query
      const { error } = await supabase
        .from("products")
        .update({ name, price, image, category, status, sizes: sizesArray, description })
        .eq("id", id);

      setLoading(false);
      if (error) {
        setMessage(`❌ Error updating product: ${error.message}`);
      } else {
        setMessage("✅ Product edits saved successfully to live database!");
        handleCancelEdit(); // Turn off edit mode and clear form fields
        fetchCurrentInventory();
      }
    } else {
      // ➕ INSERT Query
      const { error } = await supabase.from("products").insert([
        { id, name, price, image, category, status, sizes: sizesArray, description }
      ]);

      setLoading(false);
      if (error) {
        setMessage(`❌ Error adding product: ${error.message}`);
      } else {
        setMessage("✅ Product successfully uploaded straight to the live database!");
        setId(""); setName(""); setPrice(""); setImage(""); setSizesInput(""); setDescription("");
        fetchCurrentInventory();
      }
    }
  };

  // 🗑️ Delete logic
  const handleDeleteProduct = async (productId: string, productName: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to completely remove "${productName}" from your shop?`);
    if (!confirmDelete) return;

    const { error } = await supabase.from("products").delete().eq("id", productId);

    if (error) {
      setMessage(`❌ Failed to delete item: ${error.message}`);
    } else {
      setMessage(`🗑️ Removed "${productName}" successfully.`);
      if (isEditing && id === productId) {
        handleCancelEdit(); // If editing the deleted item, drop out of edit mode
      }
      fetchCurrentInventory();
    }
  };

  return (
    /* 💜 Base background gradient shifted to the new signature purple atmosphere */
    <main className="min-h-screen bg-gradient-to-b from-[#0f0a1c] via-[#050507] to-[#020203] text-white flex flex-col items-center p-6 space-y-8 selection:bg-purple-500 selection:text-white">

      {/* 1. MANAGEMENT FORM CONTAINER */}
      <div className="w-full max-w-2xl bg-[#120f1a]/60 backdrop-blur-md border border-purple-950/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden">

        {/* Decorative Ambient Purple Glow */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-between items-center border-b border-purple-950/20 pb-4 mb-6">
          <button
            onClick={() => router.push("/")}
            className="px-4 py-1.5 rounded-xl bg-neutral-950 border border-neutral-850 text-xs font-bold text-gray-400 hover:text-purple-400 hover:border-purple-500/30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            ← Leave Workspace
          </button>
          <div className="flex items-center gap-2">
            {/* 💜 Status Badge flipped to purple accent profiling */}
            {isEditing && <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-md font-bold animate-pulse">EDIT MODE</span>}
            <span className="text-xs font-mono tracking-widest text-neutral-600 uppercase">Secure Environment</span>
          </div>
        </div>

        {/* 💜 Headers changed to premium purple configuration text styling */}
        <h1 className="text-3xl font-black text-gray-100 tracking-tight">
          {isEditing ? "Modify Stock Record" : "Catalog Management"}
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {isEditing ? `Modifying existing product configurations for ID: ${id}` : "Inject dynamic items straight into production inventory tables."}
        </p>

        {/* 💜 Dynamic Action message alerts shifted over to high-end purple */}
        {message && <p className="mt-4 p-3 bg-neutral-950 border border-purple-950/20 rounded-xl text-center text-sm font-semibold text-purple-400 animate-pulse">{message}</p>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold tracking-wider text-purple-400/80 uppercase">Unique Web ID</label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                disabled={isEditing}
                placeholder="nike-dunk-grey"
                className={`w-full bg-neutral-950 border border-neutral-850 p-3 rounded-xl mt-1 text-sm focus:border-purple-500 outline-none transition-colors ${isEditing ? 'text-neutral-500 cursor-not-allowed bg-neutral-900 border-neutral-850' : ''}`}
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold tracking-wider text-purple-400/80 uppercase">Display Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nike Dunk Low Grey" className="w-full bg-neutral-950 border border-neutral-850 focus:border-purple-500 p-3 rounded-xl mt-1 text-sm outline-none transition-colors" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold tracking-wider text-purple-400/80 uppercase">Retail Price</label>
              <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="£140" className="w-full bg-neutral-950 border border-neutral-850 focus:border-purple-500 p-3 rounded-xl mt-1 text-sm outline-none transition-colors" required />
            </div>
            <div>
              <label className="text-[10px] font-bold tracking-wider text-purple-400/80 uppercase">Image Asset Path</label>
              <input type="text" value={image} onChange={(e) => setImage(e.target.value)} placeholder="/images/dunk.jpg" className="w-full bg-neutral-950 border border-neutral-850 focus:border-purple-500 p-3 rounded-xl mt-1 text-sm outline-none transition-colors" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold tracking-wider text-purple-400/80 uppercase">Category Allocation</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-neutral-950 border border-neutral-850 focus:border-purple-500 p-3 rounded-xl mt-1 text-sm outline-none transition-colors text-gray-300">
                <option value="shoes">Shoes</option>
                <option value="clothing">Clothing</option>
                <option value="jackets">Jackets</option>
                <option value="perfumes">Perfumes</option>
                <option value="tech">Tech</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold tracking-wider text-purple-400/80 uppercase">Stock Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-neutral-950 border border-neutral-850 focus:border-purple-500 p-3 rounded-xl mt-1 text-sm outline-none transition-colors text-gray-300">
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Allocated / Sold">Allocated / Sold</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-wider text-purple-400/80 uppercase">Available Sizes (Separate with commas)</label>
            <input type="text" value={sizesInput} onChange={(e) => setSizesInput(e.target.value)} placeholder="UK 8, UK 9, UK 10" className="w-full bg-neutral-950 border border-neutral-850 focus:border-purple-500 p-3 rounded-xl mt-1 text-sm outline-none transition-colors" />
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-wider text-purple-400/80 uppercase">Product Description Sheet</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Provide premium item summary metrics..." className="w-full bg-neutral-950 border border-neutral-850 focus:border-purple-500 p-3 rounded-xl mt-1 text-sm outline-none transition-colors" />
          </div>

          {/* Action Row containing Buttons */}
          <div className="flex gap-4 pt-2">
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 rounded-xl bg-neutral-950 border border-neutral-850 font-bold text-gray-400 hover:text-white hover:border-purple-900 transition-all cursor-pointer text-sm"
              >
                Cancel / Back
              </button>
            )}
            {/* 💜 Primary submission CTA wrapped to full crown neon purple scaling gradients */}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-purple-400 py-4 font-extrabold text-white tracking-wide shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
            >
              {loading ? "Writing To Live Tables..." : isEditing ? "Save Product Edits" : "Push New Stock Live"}
            </button>
          </div>
        </form>
      </div>

      {/* 2. LIVE STOCK MANAGEMENT AREA */}
      <div className="w-full max-w-2xl bg-[#120f1a]/60 backdrop-blur-md border border-purple-950/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <h2 className="text-xl font-extrabold text-white">Live Catalog Status Log</h2>
        <p className="text-gray-500 text-xs mt-1">Review live catalog layout metadata and modify or strip stock lines out of database instantly.</p>

        <div className="mt-6 divide-y divide-purple-950/20 max-h-96 overflow-y-auto pr-2 no-scrollbar">
          {dbProducts.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No catalog lines returned. Store is currently clear.</p>
          ) : (
            dbProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <img src={product.image} alt="" className="w-12 h-12 rounded-xl bg-neutral-950 border border-purple-950/30 object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/images/logo.png' }} />
                  <div>
                    <h3 className="text-sm font-bold text-gray-200">{product.name}</h3>
                    {/* 💜 Inline text identifiers modified to match purple details formatting */}
                    <p className="text-xs text-purple-400 font-mono mt-0.5">{product.price} • <span className="text-neutral-500 uppercase">{product.category}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* 💜 Row action buttons themed to purple accents */}
                  <button
                    onClick={() => handleEditTrigger(product)}
                    className="px-3 py-1.5 text-xs font-bold text-purple-400 bg-purple-500/5 border border-purple-500/10 rounded-xl hover:bg-purple-500/20 active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id, product.name)}
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
    </main>
  );
}