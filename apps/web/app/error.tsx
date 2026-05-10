"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console — replace with Sentry or similar in production
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-[var(--color-f1-red)]/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg transition-reveal">
        <div className="w-16 h-16 bg-[var(--color-f1-red)]/10 border border-[var(--color-f1-red)]/20 rounded-2xl flex items-center justify-center mb-8">
          <AlertTriangle size={32} className="text-[var(--color-f1-red)]" />
        </div>

        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--color-f1-red)] mb-4">
          System Error
        </div>

        <h2 className="text-4xl font-black italic tracking-tighter mb-4 text-[var(--color-text-primary)]">
          SOMETHING WENT WRONG
        </h2>

        <p className="text-sm text-[var(--color-text-secondary)] mb-10 leading-relaxed font-medium">
          An unexpected error occurred. Try refreshing the page or return to the home page.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-[var(--color-f1-red)] text-white rounded-lg font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-ui"
          >
            <RefreshCcw size={14} />
            Try Again
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 border border-white/10 text-white rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-white/5 hover:border-white/30 transition-ui"
          >
            <Home size={14} />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
