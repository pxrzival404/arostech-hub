"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function PageLoader() {
  const [loading, setLoading] = useState(true);
  const [unmounted, setUnmounted] = useState(false);

  const hide = useCallback(() => {
    setLoading(false);
    setTimeout(() => setUnmounted(true), 600);
  }, []);

  useEffect(() => {
    const safetyTimer = setTimeout(hide, 2000);

    if (document.readyState === "complete") {
      const loadTimer = setTimeout(hide, 800);
      return () => {
        clearTimeout(safetyTimer);
        clearTimeout(loadTimer);
      };
    }

    const handleLoad = () => {
      setTimeout(hide, 400);
    };
    window.addEventListener("load", handleLoad);

    return () => {
      clearTimeout(safetyTimer);
      window.removeEventListener("load", handleLoad);
    };
  }, [hide]);

  if (unmounted) return null;

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-white"
        >
          {/* Subtle background pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #047857 1px, transparent 1px)",
              backgroundSize: "24px24px",
            }}
          />

          <div className="flex flex-col items-center gap-5">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative"
            >
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-emerald-700/20"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              {/* Logo box */}
              <motion.div
                className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-emerald-700/30"
                animate={{
                  boxShadow: [
                    "0 10px 30px -5px rgba(4, 120, 87, 0.3)",
                    "0 15px 40px -5px rgba(4, 120, 87, 0.4)",
                    "0 10px 30px -5px rgba(4, 120, 87, 0.3)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Image src="/logo.png" alt="DBSN Dayaberkah.id" width={64} height={64} className="w-full h-full object-cover" />
              </motion.div>
            </motion.div>

            {/* Company Name */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <span className="text-xl font-bold text-emerald-800 tracking-tight">
                DBSN
              </span>
              <span className="text-xs text-emerald-600 font-medium tracking-widest uppercase">
                Dayaberkah.id
              </span>
            </motion.div>

            {/* Loading bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="w-32 h-1 bg-emerald-100 rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 1.2,
                  delay: 0.3,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
