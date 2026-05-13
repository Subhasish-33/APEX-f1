"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScanBarProps {
  className?: string;
  direction?: "horizontal" | "vertical";
  speed?: number;
}

export default function ScanBar({
  className,
  direction = "horizontal",
  speed = 4
}: ScanBarProps) {
  return (
    <div className={cn("absolute pointer-events-none overflow-hidden", className)}>
      <motion.div
        className={cn(
          "bg-gradient-to-r from-transparent via-white/10 to-transparent",
          direction === "horizontal" ? "w-full h-[1px]" : "h-full w-[1px] bg-gradient-to-b"
        )}
        animate={
          direction === "horizontal" 
            ? { translateY: ["0%", "1000%"] } 
            : { translateX: ["0%", "1000%"] }
        }
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
}
