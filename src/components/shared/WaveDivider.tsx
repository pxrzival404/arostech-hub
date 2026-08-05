"use client";

import { cn } from "@/lib/utils";

interface WaveDividerProps {
  variant?: "emerald-amber" | "white-emerald" | "emerald-white" | "gray-white" | "white-gray";
  flip?: boolean;
  className?: string;
}

const colorStops: Record<NonNullable<WaveDividerProps["variant"]>, { top: string; bottom: string }> = {
  "emerald-amber": { top: "#d1fae5", bottom: "#fffbeb" },
  "white-emerald": { top: "#ffffff", bottom: "#ecfdf5" },
  "emerald-white": { top: "#ecfdf5", bottom: "#ffffff" },
  "gray-white": { top: "#f9fafb", bottom: "#ffffff" },
  "white-gray": { top: "#ffffff", bottom: "#f9fafb" },
};

export default function WaveDivider({
  variant = "emerald-amber",
  flip = false,
  className,
}: WaveDividerProps) {
  const { top, bottom } = colorStops[variant];

  return (
    <div
      className={cn("w-full overflow-hidden leading-[0]", className)}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className={cn(
          "w-full h-[40px] md:h-[60px]",
          flip && "rotate-180"
        )}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Horizontal gradient for wave color transition */}
          <linearGradient
            id={`wave-h-${variant}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor={top} />
            <stop offset="100%" stopColor={bottom} />
          </linearGradient>
          {/* Vertical gradient for fade effect (top = solid, bottom = transparent) */}
          <linearGradient
            id={`wave-v-${variant}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </linearGradient>
          {/* Mask for vertical fade */}
          <mask id={`wave-mask-${variant}`}>
            <rect x="0" y="0" width="1440" height="80" fill={`url(#wave-v-${variant})`} />
          </mask>
        </defs>
        {/* Reduced amplitude wave: curves only 20px instead of 40px */}
        <path
          d="M0,50 C240,70 480,30 720,50 C960,70 1200,30 1440,50 L1440,80 L0,80 Z"
          fill={`url(#wave-h-${variant})`}
          mask={`url(#wave-mask-${variant})`}
        />
      </svg>
    </div>
  );
}
