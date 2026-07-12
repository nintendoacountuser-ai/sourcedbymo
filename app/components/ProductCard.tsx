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
    /* 💜 Outer border updated to match the stealth purple profile and glow dynamically on hover */
    <div className="w-full max-w-[340px] sm:max-w-[280px] bg-[#120f1a]/80 backdrop-blur-md rounded-2xl border border-purple-950/40 overflow-hidden hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300 flex flex-col mx-auto shadow-lg">

      {/* Product Image Container */}
      <div className="w-full aspect-square bg-neutral-950 flex items-center justify-center overflow-hidden rounded-t-2xl relative border-b border-purple-950/20">
        <img
          src={image || "/images/placeholder.png"}
          alt={name}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* Product Details */}
      <div className="p-4 md:p-5 flex flex-col justify-between flex-grow bg-gradient-to-b from-transparent to-black/40">
        <div>
          <h3 className="text-sm md:text-base font-bold text-gray-200 line-clamp-2 min-h-[40px] md:min-h-[48px]">
            {name}
          </h3>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          {/* 💜 Price tag shifted from gold/yellow to premium neon purple text */}
          <span className="text-base md:text-lg font-black text-purple-400">
            £{price}
          </span>

          {/* 💜 Button action flipped to match the electric purple crown visual theme */}
          <Link
            href={`/product/${id}`}
            className="px-3.5 py-2 bg-neutral-950 hover:bg-purple-600 border border-neutral-850 hover:border-purple-500 text-gray-300 hover:text-white text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-[0_0_10px_rgba(168,85,247,0.3)]"
          >
            View Item
          </Link>
        </div>
      </div>

    </div>
  );
}