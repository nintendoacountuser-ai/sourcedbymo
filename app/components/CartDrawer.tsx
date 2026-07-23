"use client";

import Image from "next/image";
import { useCart } from "../context/CartContext";

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0a0712] border-l border-purple-900/40 text-white flex flex-col justify-between shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-purple-950/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h2 className="text-lg font-extrabold tracking-wide">Your Cart</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-gray-400 hover:text-white text-xl p-1 focus:outline-none"
            >
              ✕
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p className="text-sm font-medium">Your cart is currently empty.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 p-3 rounded-xl bg-neutral-950/60 border border-purple-950/30 items-center">
                  <div className="relative w-16 h-16 rounded-lg bg-neutral-900 overflow-hidden shrink-0 border border-purple-950/40">
                    <Image src={item.image} fill className="object-cover" alt={item.name} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold truncate text-gray-200">{item.name}</h4>
                    {item.selectedSize && (
                      <span className="text-[10px] text-purple-400 font-semibold block">Size: {item.selectedSize}</span>
                    )}
                    <p className="text-xs font-extrabold text-white mt-1">£{item.price}</p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)}
                        className="w-5 h-5 flex items-center justify-center rounded bg-purple-950/50 text-xs text-purple-300 hover:bg-purple-800"
                      >
                        -
                      </button>
                      <span className="text-xs font-semibold px-1">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                        className="w-5 h-5 flex items-center justify-center rounded bg-purple-950/50 text-xs text-purple-300 hover:bg-purple-800"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id, item.selectedSize)}
                    className="text-gray-500 hover:text-red-400 text-sm p-1"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Checkout Footer */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-purple-950/40 bg-neutral-950/80">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-gray-400 uppercase font-semibold">Subtotal</span>
                <span className="text-lg font-black text-purple-300">£{subtotal.toFixed(2)}</span>
              </div>

              <button
                onClick={() => alert("Proceeding to checkout...")}
                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                Checkout Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}