import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  error = "An unexpected error occurred in the intelligence pipeline.", 
  onRetry,
  className, 
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center bg-status-danger/5 border border-status-danger/20 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500",
        className
      )}
      {...props}
    >
      <div className="w-12 h-12 rounded-full bg-status-danger/20 flex items-center justify-center text-status-danger mb-6">
        <AlertCircle size={24} />
      </div>
      <h3 className="text-xl font-black text-text-primary font-display uppercase tracking-tight mb-2">
        System Outage Detected
      </h3>
      <p className="text-sm text-text-secondary max-w-sm mx-auto mb-8 font-sans">
        {error}
      </p>
      
      <div className="flex items-center gap-4">
        {onRetry && (
          <button 
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-2 bg-f1-red text-white text-xs font-black uppercase tracking-widest rounded-sm transition-ui hover:bg-f1-red/80 active:scale-95"
          >
            <RefreshCw size={14} />
            Re-init Pipeline
          </button>
        )}
        <Link 
          href="/"
          className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-sm transition-ui hover:bg-white/10"
        >
          <Home size={14} />
          Back to Base
        </Link>
      </div>
    </div>
  );
};

export default ErrorState;
