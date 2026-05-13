import React from "react";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title = "No Data Found", 
  description = "No records match your current filtering criteria.", 
  icon = <Info size={32} className="text-white/20" />,
  className, 
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center bg-white/[0.02] border border-white/5 rounded-3xl animate-in fade-in zoom-in-95 duration-500",
        className
      )}
      {...props}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-black text-text-primary font-display uppercase tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-sm text-text-secondary max-w-xs mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default EmptyState;
