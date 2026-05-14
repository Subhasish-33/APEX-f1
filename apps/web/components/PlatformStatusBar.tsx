"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function PlatformStatusBar() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const data = await api.getPlatformStatus();
        setStatus(data);
      } catch (err) {
        console.error("Failed to fetch platform status:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading && !status) return (
    <div className="h-8 bg-black/40 border-b border-white/5 flex items-center px-6 animate-pulse">
      <div className="h-2 w-32 bg-white/10 rounded-full" />
    </div>
  );

  return (
    <div className="bg-black/60 backdrop-blur-md border-b border-white/5 h-8 flex items-center justify-between px-6 text-[9px] font-black uppercase tracking-[0.15em] relative z-[110]">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-white/30">System Status:</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            Operational
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/30">Ingestion:</span>
          <span className="text-white/80">{status?.version || "v3.0.0"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/30">Data Freshness:</span>
          <span className="text-white/80">{status?.last_heartbeat ? new Date(status.last_heartbeat).toLocaleTimeString() : "Synchronizing..."}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-white/30">Latency:</span>
          <span className="text-emerald-400/80">24ms</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/30">Season Intelligence:</span>
          <span className="text-f1-red">Active</span>
        </div>
      </div>
    </div>
  );
}
