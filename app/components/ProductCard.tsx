import Link from "next/link"; // 1. Import Next.js client router Link component

type ProductProps = {
  id: string; // 2. Add 'id' here to look up the correct route url
  name: string;
  price: string;
  image: string;
};

export default function ProductCard({ id, name, price, image }: ProductProps) {
  return (
    <div className="group w-72 rounded-2xl bg-[#111] p-5 border border-neutral-900 shadow-md hover:border-neutral-800 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">

      <div>
        {/* Animated Image Container */}
        <div className="h-56 w-full rounded-xl overflow-hidden bg-neutral-900">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Text Details */}
        <h3 className="mt-5 text-xl font-bold text-white capitalize truncate">
          {name}
        </h3>

        <p className="mt-1 text-lg font-semibold text-yellow-400">
          {price}
        </p>
      </div>

      {/* 3. Wrap button inside a Link matching your route folder string layout */}
      <Link href={`/product/${id}`} className="w-full mt-6">
        <button className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-300 py-3 font-bold text-black shadow-lg opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-300 cursor-pointer">
          View Product
        </button>
      </Link>

    </div>
  );
}