import React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  accent?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle, 
  action,
  accent = false,
  className,
  ...props 
}) => {
  return (
    <div className={cn("flex items-end justify-between gap-4 mb-8", className)} {...props}>
      <div className="flex flex-col gap-1">
        {accent && <div className="w-12 h-1 bg-f1-red mb-2" />}
        <h2 className="text-3xl font-black text-text-primary font-display uppercase tracking-tight leading-none">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-text-secondary font-sans">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
