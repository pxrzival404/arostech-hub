"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

const RADIUS = 18;
const STROKE = 3;
const NORMALIZED_RADIUS = RADIUS - STROKE / 2;
const CIRCUMFERENCE = 2 * Math.PI * NORMALIZED_RADIUS;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const percentage = docHeight > 0 ? Math.min((scrollY / docHeight) * 100, 100) : 0;

      setVisible(scrollY > 600);
      setProgress(percentage);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;
  const isComplete = progress >= 100;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-40 flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] cursor-pointer group"
          aria-label="Kembali ke atas"
        >
          <svg
            width="44"
            height="44"
            viewBox="0 0 44 44"
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx="22"
              cy="22"
              r={NORMALIZED_RADIUS}
              fill="white"
              stroke="currentColor"
              strokeWidth={STROKE}
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle */}
            <circle
              cx="22"
              cy="22"
              r={NORMALIZED_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              className="text-emerald-600 dark:text-emerald-400 transition-[stroke-dashoffset] duration-150 ease-out"
            />
          </svg>
          {/* Arrow icon with pulse at 100% */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              animate={isComplete ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={isComplete ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {}}
            >
              <ArrowUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400 transition-transform group-hover:-translate-y-0.5" />
            </motion.div>
            <span className="text-[8px] font-semibold text-emerald-700 dark:text-emerald-400 -mt-0.5 leading-none">
              {Math.round(progress)}%
            </span>
          </div>
          {/* Pulse ring when complete */}
          {isComplete && (
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-emerald-500 dark:border-emerald-400"
              animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
