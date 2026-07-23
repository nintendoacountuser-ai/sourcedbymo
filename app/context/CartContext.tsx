"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  selectedSize?: string;
  quantity: number;
}

// Allow quantity to be optionally passed when adding to cart
export type AddToCartInput = Omit<CartItem, "quantity"> & { quantity?: number };

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: AddToCartInput) => void;
  removeFromCart: (id: string, selectedSize?: string) => void;
  updateQuantity: (id: string, quantity: number, selectedSize?: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load cart from localStorage after component mounts
  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem("sourced_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to load cart from localStorage", e);
      }
    }
  }, []);

  // Sync cart state to localStorage whenever it changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("sourced_cart", JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const addToCart = (newItem: AddToCartInput) => {
    const qtyToAdd = newItem.quantity && newItem.quantity > 0 ? newItem.quantity : 1;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (i) => i.id === newItem.id && i.selectedSize === newItem.selectedSize
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += qtyToAdd;
        return updated;
      }

      return [
        ...prevCart,
        {
          id: newItem.id,
          name: newItem.name,
          price: newItem.price,
          image: newItem.image,
          selectedSize: newItem.selectedSize,
          quantity: qtyToAdd,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (id: string, selectedSize?: string) => {
    setCart((prev) => prev.filter((i) => !(i.id === id && i.selectedSize === selectedSize)));
  };

  const updateQuantity = (id: string, quantity: number, selectedSize?: string) => {
    if (quantity <= 0) {
      removeFromCart(id, selectedSize);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.selectedSize === selectedSize ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}