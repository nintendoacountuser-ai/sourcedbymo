"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const MASTER_KEY = "ksta";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (passcode === MASTER_KEY) {
      setError("");
      localStorage.setItem("isMoAdmin", "true");
      router.push("/admin");
    } else {
      setError("Invalid admin access key.");
    }
  };

  return (
    /* 💜 Background gradient adjusted to deep purple stealth luxury profile */
    <main className="min-h-screen bg-gradient-to-b from-[#0f0a1c] via-[#050507] to-[#020203] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-[#120f1a]/80 backdrop-blur-md rounded-3xl p-8 border border-purple-950/40 shadow-2xl relative overflow-hidden">

        {/* Decorative Ambient Purple Glow */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center">
          {/* 💜 Header changed from gold to gradient neon purple matching the title lines */}
          <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            Mo Admin Login
          </h1>
          <p className="mt-2 text-sm text-gray-400">Enter authorization key to manage live catalog stock.</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <input
            type="password"
            placeholder="••••••••••••••"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-850 focus:border-purple-500/60 rounded-xl px-4 py-3 text-white text-center font-mono tracking-widest outline-none transition-colors"
            required
          />
          {error && <p className="text-xs text-red-400 text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>}

          {/* 💜 Submit button converted to the electric purple styling */}
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-400 hover:brightness-110 py-3 font-extrabold text-white cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all"
          >
            Access Database Panel
          </button>
        </form>
      </div>
    </main>
  );
}