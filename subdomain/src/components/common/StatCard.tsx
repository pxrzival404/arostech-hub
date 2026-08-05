"use client";

import { motion } from "framer-motion";

interface StatCardProps {
  value: string;
  label: string;
  suffix?: string;
}

export function StatCard({ value, label, suffix }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="text-center"
    >
      <div className="text-4xl font-bold text-white sm:text-5xl">
        {value}
        {suffix && <span className="text-emerald-200">{suffix}</span>}
      </div>
      <div className="mt-2 text-emerald-100 text-sm sm:text-base">{label}</div>
    </motion.div>
  );
}
