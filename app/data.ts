// src/data.ts

export type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  category: "shoes" | "clothing" | "jackets" | "perfumes" | "tech";
  status: "In Stock" | "Low Stock" | "Allocated / Sold";
  sizes?: string[]; // Optional array of sizes (works for shoes/clothing)
  description?: string; // Optional custom description block
};

export const productsData: Product[] = [
  {
    id: "nike-miller-3-piece",
    name: "nike miller 3 piece",
    price: "£55",
    image: "/images/nikemiller3.jpg",
    category: "clothing",
    status: "In Stock",
    sizes: ["S", "M", "L", "XL"],
    description: "Premium Nike Miller 3-piece tracking sets. Breathable luxury athletic fabrics maximizing comfort and styling performance."
  },
  {
    id: "nike-dunk-low",
    name: "Nike Dunk Low",
    price: "£140",
    image: "/images/dunklow.jpg",
    category: "shoes",
    status: "Low Stock",
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    description: "Classic Nike Dunk Low colorways. Shipped brand new deadstock with original verified receipt credentials and box protection wrappers."
  },
  {
    id: "essentials-hoodie",
    name: "Essentials Hoodie",
    price: "£95",
    image: "/images/hoodie.jpg",
    category: "jackets",
    status: "In Stock",
    sizes: ["S", "M", "L"],
    description: "Fear of God Essentials luxury oversized hoodie drop. Matte heavy-weight premium loopback fleece cotton construction."
  },
  {
    id: "reef-33",
    name: "Reef 33",
    price: "£45",
    image: "/images/reef.jpg",
    category: "perfumes",
    status: "In Stock",
    sizes: ["100ml", "200ml", "500ml"],
    description: "perfume"
  }
];