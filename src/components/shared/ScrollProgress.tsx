"use client";

import { useState } from "react";
import { motion, useScroll, useSpring, useMotionValueEvent } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  const [width, setWidth] = useState("0%");

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setWidth(`${Math.min(latest * 100, 100)}%`);
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-[3px] origin-left"
      style={{
        scaleX,
        background: "linear-gradient(to right, #047857, #f59e0b)",
        width,
      }}
    />
  );
}
