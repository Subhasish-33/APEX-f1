import React from "react";
import { cn } from "@/lib/utils";

export interface PositionBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  position: number | string;
}

const PositionBadge: React.FC<PositionBadgeProps> = ({ 
  position, 
  className,
  ...props 
}) => {
  const getStyle = (p: number | string) => {
    if (p === 1 || p === "1") return "bg-f1-red text-white border-f1-red"; // Winner gets Red
    if (p === 2 || p === "2") return "bg-white/10 text-text-primary border-white/20";
    if (p === 3 || p === "3") return "bg-white/5 text-text-secondary border-white/10";
    
    const pNum = typeof p === "string" ? parseInt(p) : p;
    if (isNaN(pNum)) return "bg-status-danger/20 text-status-danger border-status-danger/30"; // DNF/DNS
    
    return "bg-transparent text-text-muted border-white/5";
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center justify-center w-8 h-8 rounded-sm border font-display font-black text-sm transition-ui",
        getStyle(position),
        className
      )}
      {...props}
    >
      {position}
    </div>
  );
};

export default PositionBadge;
