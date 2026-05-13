import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "outline";
  size?: "sm" | "md";
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = "primary", 
  size = "md",
  className,
  ...props 
}) => {
  const variants = {
    primary: "bg-f1-red text-white border-transparent",
    secondary: "bg-bg-tertiary text-text-secondary border-white/10",
    success: "bg-status-success/20 text-status-success border-status-success/30",
    warning: "bg-status-warning/20 text-status-warning border-status-warning/30",
    danger: "bg-status-danger/20 text-status-danger border-status-danger/30",
    outline: "bg-transparent text-text-primary border-white/20",
  };

  const sizes = {
    sm: "px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
    md: "px-2 py-0.5 text-xs font-bold uppercase tracking-wider",
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-sm border font-display transition-ui",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Badge;
