"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DriverImageProps extends Omit<ImageProps, "src"> {
  src: string;
  blurSrc?: string;
  containerClassName?: string;
  cropPosition?: "top" | "center" | "bottom";
}

export default function DriverImage({
  src,
  blurSrc,
  alt,
  containerClassName,
  className,
  priority = false,
  cropPosition = "center",
  ...props
}: DriverImageProps) {
  const [isLoading, setLoading] = useState(true);

  const cropClass = {
    top: "object-top",
    center: "object-center",
    bottom: "object-bottom",
  }[cropPosition];

  return (
    <div className={cn("relative overflow-hidden bg-white/5", containerClassName)}>
      <Image
        src={src}
        alt={alt}
        className={cn(
          "duration-700 ease-in-out transition-all",
          isLoading ? "scale-105 blur-lg grayscale" : "scale-100 blur-0 grayscale-0",
          cropClass,
          className
        )}
        onLoad={() => setLoading(false)}
        placeholder={blurSrc ? "blur" : "empty"}
        blurDataURL={blurSrc}
        priority={priority}
        {...props}
      />
    </div>
  );
}
