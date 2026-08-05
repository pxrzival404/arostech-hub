"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";

type ScrollRevealVariant = "fade-up" | "fade-in" | "scale-in";

interface ScrollRevealProps {
  variant?: ScrollRevealVariant;
  delay?: number;
  className?: string;
  children: ReactNode;
}

const variants = {
  "fade-up": {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-in": {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  "scale-in": {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
};

export default function ScrollReveal({
  variant = "fade-up",
  delay = 0,
  className,
  children,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants[variant]}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
