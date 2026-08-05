"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ClipboardList, Factory, Wrench, CheckCircle2, Workflow } from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";

const steps = [
  { number: 1, title: "Konsultasi", icon: MessageSquare, description: "Diskusi kebutuhan dan survey lokasi" },
  { number: 2, title: "Perencanaan", icon: ClipboardList, description: "Desain teknis dan proposal penawaran" },
  { number: 3, title: "Produksi", icon: Factory, description: "Manufaktur dengan standar SNI/ISO" },
  { number: 4, title: "Instalasi", icon: Wrench, description: "Pemasangan oleh tim bersertifikasi" },
  { number: 5, title: "Serah Terima", icon: CheckCircle2, description: "Garansi dan dukungan purna jual" },
];

export default function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"],
  });
  const lineWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const widthStyle = !mounted ? "0%" : (reduceMotion ? "100%" : lineWidth);

  return (
    <section ref={sectionRef} id="proses" className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal delay={0}>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="outline" className="border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 mb-4">
              <Workflow className="w-3.5 h-3.5 mr-1.5" />Alur Kerja
            </Badge>
            <h2 className="section-heading">Alur Kerja Kami</h2>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
              Proses profesional dari konsultasi hingga serah terima
            </p>
          </div>
        </ScrollReveal>

        {/* Desktop: Horizontal Timeline */}
        <div className="hidden lg:block">
          <div className="relative flex items-start justify-between">
            {/* Track base */}
            <div className="absolute top-7 left-[10%] right-[10%] h-0.5 bg-emerald-100 dark:bg-emerald-900/50" />
            {/* Scroll-linked progress overlay */}
            <div className="absolute top-7 left-[10%] right-[10%] h-0.5 overflow-hidden">
              <motion.div
                style={{ width: widthStyle }}
                className="h-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-400 dark:from-emerald-600 dark:via-emerald-500 dark:to-amber-500 origin-left"
              />
            </div>
            {/* Glow */}
            <div className="absolute top-[30px] left-[10%] right-[10%] h-1 blur-sm bg-gradient-to-r from-emerald-400/30 via-emerald-300/30 to-amber-400/30" />
            {steps.map((step, index) => (
              <ScrollReveal key={step.number} delay={index * 0.15} className="w-[20%]">
                <div className="flex flex-col items-center w-full group">
                  <div className="relative z-10 w-14 h-14 rounded-full bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 mb-2 border-2 border-emerald-200 dark:border-emerald-700 group-hover:border-emerald-400">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="w-7 h-7 rounded-full bg-emerald-600 dark:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center -mt-2 mb-4 ring-4 ring-white dark:ring-gray-900 shadow-md">
                    {step.number}
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 w-full max-w-[220px] text-center shadow-sm hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 border border-gray-100 dark:border-gray-700 group-hover:-translate-y-1">
                    <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm sm:text-base mb-2">{step.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Mobile / Tablet: Vertical Timeline */}
        <div className="lg:hidden">
          <div className="relative pl-8 sm:pl-12">
            <div className="absolute left-[11px] sm:left-[15px] top-6 bottom-6 w-0.5 min-w-[2px] bg-gradient-to-b from-emerald-400 via-emerald-300 to-amber-400 dark:from-emerald-600 dark:via-emerald-500 dark:to-amber-500" />
            {steps.map((step, index) => (
              <ScrollReveal key={step.number} delay={index * 0.1}>
                <div className="relative flex gap-4 sm:gap-6 mb-8 last:mb-0 group">
                  <div className="absolute -left-8 sm:-left-12 top-0 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-gray-900 group-hover:scale-110 transition-all duration-300 border-2 border-emerald-200 dark:border-emerald-700">
                    <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 border border-gray-100 dark:border-gray-700 group-hover:-translate-y-0.5">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 dark:bg-emerald-700 text-white text-xs sm:text-sm font-bold shrink-0">
                        {step.number}
                      </span>
                      <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm sm:text-base">{step.title}</h3>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed ml-10">{step.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
