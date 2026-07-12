"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// 1. We move the UI logic into a separate internal component that safely reads the params
function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("session_id");

  return (
    <div className="max-w-md w-full bg-[#120f1a]/60 backdrop-blur-md border border-purple-950/40 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">

      {/* Decorative Ambient Purple Background Glow */}
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Success Icon Badge with Purple accents */}
      <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
        <span className="text-2xl">⚡</span>
      </div>

      <h1 className="text-3xl font-black tracking-tight text-gray-100">
        Allocation Secured
      </h1>

      <p className="mt-3 text-sm text-purple-400 font-semibold tracking-wide uppercase">
        Payment Processed Successfully
      </p>

      <p className="mt-4 text-sm text-gray-400 leading-relaxed">
        Thank you for shopping with SourcedByMo. Your premium asset line has been officially claimed. A confirmation receipt is being routed directly to your inbox.
      </p>

      {sessionId && (
        <div className="mt-6 p-3 bg-neutral-950 border border-neutral-900 rounded-xl">
          <p className="text-[10px] text-neutral-500 font-mono tracking-tight break-all">
            Ref ID: {sessionId.slice(0, 24)}...
          </p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-neutral-900/60">
        <Link
          href="/"
          className="block w-full py-3 bg-gradient-to-r from-purple-600 to-purple-400 hover:brightness-110 text-white font-extrabold text-xs rounded-xl tracking-wide transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)]"
        >
          Return to Supply Lines
        </Link>
      </div>
    </div>
  );
}

// 2. The main page component wraps the content in Suspense so Next.js can build it cleanly
export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f0a1c] via-[#050507] to-[#020203] text-white flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="text-center">
          <p className="text-sm font-medium animate-pulse tracking-widest uppercase text-purple-400/80">
            Verifying Transaction Session...
          </p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </main>
  );
}