"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-f1-red font-black text-6xl mb-4">BOX BOX.</div>
      <h2 className="text-2xl font-bold mb-2">Technical Malfunction</h2>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        Our engineers are looking at the data. The telemetry indicates an unexpected error in the sector.
      </p>
      <div className="flex space-x-4">
        <button
          onClick={() => reset()}
          className="bg-f1-red text-white px-6 py-2 rounded-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="border border-white/20 text-white px-6 py-2 rounded-sm font-bold uppercase tracking-wider hover:bg-white/10 transition-colors"
        >
          Back to Pits
        </Link>
      </div>
    </div>
  );
}
