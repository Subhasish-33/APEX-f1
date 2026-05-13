import React from "react";
import { cn } from "@/lib/utils";
import { RefreshCcw } from "lucide-react";

interface RetryStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

const RetryState: React.FC<RetryStateProps> = ({ 
  message = "Data delivery failed. Manual re-sync required.", 
  onRetry,
  isRetrying = false,
  className, 
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-2xl",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black text-status-warning uppercase tracking-widest">
          SYNC INTERRUPTED
        </span>
        <p className="text-sm text-text-secondary font-sans">
          {message}
        </p>
      </div>
      <button 
        onClick={onRetry}
        disabled={isRetrying}
        className={cn(
          "flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-sm transition-ui hover:bg-white/10 active:scale-95 disabled:opacity-50",
          isRetrying && "cursor-not-allowed"
        )}
      >
        <RefreshCcw size={14} className={cn(isRetrying && "animate-spin")} />
        {isRetrying ? "Syncing..." : "Re-sync"}
      </button>
    </div>
  );
};

export default RetryState;
