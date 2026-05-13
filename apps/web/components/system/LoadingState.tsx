import React from "react";
import { cn } from "@/lib/utils";

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = "Loading Intelligence Data...", className, ...props }) => {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center p-12 min-h-[200px] animate-in fade-in duration-500",
        className
      )}
      {...props}
    >
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 border-2 border-white/10 rounded-full" />
        <div className="absolute inset-0 border-2 border-f1-red rounded-full border-t-transparent animate-spin" />
      </div>
      <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default LoadingState;
