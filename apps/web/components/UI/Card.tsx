import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "solid" | "outline";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  variant = "solid", 
  padding = "md",
  hover = false,
  className,
  ...props 
}) => {
  const variants = {
    glass: "bg-white/5 backdrop-blur-md border-white/10 shadow-glass",
    solid: "bg-bg-secondary border-white/5",
    outline: "bg-transparent border-white/10",
  };

  const paddings = {
    none: "p-0",
    sm: "p-3",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div 
      className={cn(
        "rounded-md border overflow-hidden transition-ui",
        variants[variant],
        paddings[padding],
        hover && "hover:border-white/20 hover:bg-white/[0.07]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
