import React from "react";
import { cn } from "@/lib/utils";

export interface StatItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  trend?: {
    value: number | string;
    direction: "up" | "down" | "neutral";
  };
  icon?: React.ReactNode;
}

const StatItem: React.FC<StatItemProps> = ({ 
  label, 
  value, 
  trend, 
  icon,
  className,
  ...props 
}) => {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-text-secondary font-display">
        {icon}
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-text-primary font-display leading-none">
          {value}
        </span>
        {trend && (
          <span className={cn(
            "text-[10px] font-bold font-mono",
            trend.direction === "up" ? "text-status-success" : 
            trend.direction === "down" ? "text-status-danger" : "text-text-muted"
          )}>
            {trend.direction === "up" ? "+" : trend.direction === "down" ? "-" : ""}{trend.value}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatItem;
