"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const MASTER_KEY = "MO-SUPPLY-2026";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (passcode === MASTER_KEY) {
      setError("");
      // Save state to keep admin logged in during session
      localStorage.setItem("isMoAdmin", "true");
      router.push("/admin"); // Push straight to the admin backend dashboard panel
    } else {
      setError("Invalid admin access key.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2a2a2a] via-[#111] to-[#050505] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-[#111] rounded-3xl p-8 border border-neutral-900 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-yellow-400">Mo Admin Login</h1>
          <p className="mt-2 text-sm text-gray-400">Enter authorization key to manage live catalog stock.</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <input
            type="password"
            placeholder="••••••••••••••"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white text-center font-mono tracking-widest"
            required
          />
          {error && <p className="text-xs text-red-400 text-center bg-red-500/10 py-2 rounded-lg">{error}</p>}
          <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-300 py-3 font-bold text-black cursor-pointer shadow-lg">
            Access Database Panel
          </button>
        </form>
      </div>
    </main>
  );
}