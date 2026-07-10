// app/components/ProductCard.tsx
import Link from "next/link";

interface ProductProps {
  id: string;
  name: string;
  price: number;
  image: string;
}

export default function ProductCard({ id, name, price, image }: ProductProps) {
  return (
    /* Increased sizing constraints for a larger presence */
    <div className="w-full max-w-[340px] sm:max-w-[280px] bg-[#111]/90 rounded-2xl border border-neutral-900 overflow-hidden hover:border-neutral-800 transition-all duration-300 flex flex-col mx-auto shadow-lg">

      {/* Product Image Container — Rounded to match the outer card container */}
      <div className="w-full aspect-square bg-[#1a1a1a] flex items-center justify-center overflow-hidden rounded-t-2xl relative border-b border-neutral-900/40">
        <img
          src={image || "/images/placeholder.png"}
          alt={name}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* Product Details */}
      <div className="p-4 md:p-5 flex flex-col justify-between flex-grow bg-gradient-to-b from-transparent to-black/20">
        <div>
          <h3 className="text-sm md:text-base font-semibold text-gray-200 line-clamp-2 min-h-[40px] md:min-h-[48px]">
            {name}
          </h3>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-base md:text-lg font-black text-yellow-400">
            £{price}
          </span>
          <Link href={`/product/${id}`} className="px-3.5 py-2 bg-neutral-900 hover:bg-yellow-400 hover:text-black text-white text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap">
            View Item
          </Link>
        </div>
      </div>

    </div>
  );
}