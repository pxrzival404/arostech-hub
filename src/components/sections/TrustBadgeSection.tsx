"use client";

import { useRef, useEffect, useState } from "react";
import { Building2, Calendar, MapPin, Users } from "lucide-react";
import { useCounter } from "@/hooks/use-counter";
import ScrollReveal from "@/components/shared/ScrollReveal";

const stats = [
  {
    icon: Building2,
    value: 500,
    suffix: "+",
    label: "Proyek Selesai",
  },
  {
    icon: Calendar,
    value: 15,
    suffix: "+",
    label: "Tahun Pengalaman",
  },
  {
    icon: MapPin,
    value: 30,
    suffix: "+",
    label: "Kota di Indonesia",
  },
  {
    icon: Users,
    value: 50,
    suffix: "+",
    label: "Klien Terpercaya",
  },
];

const partners = [
  { name: "PLN", initials: "PLN", color: "bg-amber-600" },
  { name: "Pertamina", initials: "PTM", color: "bg-blue-700" },
  { name: "Telkom Indonesia", initials: "TLK", color: "bg-red-600" },
  { name: "WIKA", initials: "WKA", color: "bg-blue-800" },
  { name: "Adhi Karya", initials: "ADK", color: "bg-red-700" },
  { name: "Pemkot Surabaya", initials: "SBY", color: "bg-emerald-700" },
  { name: "Pemprov Jatim", initials: "JTM", color: "bg-emerald-600" },
  { name: "Bappenas", initials: "BPN", color: "bg-sky-700" },
  { name: "Waskita Karya", initials: "WSK", color: "bg-amber-700" },
  { name: "Kemenkes RI", initials: "KMK", color: "bg-teal-600" },
];

function StatItem({ icon: Icon, value, suffix, label, index }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const count = useCounter(value, 1500, inView);

  return (
    <div ref={ref} className="flex items-center gap-3 px-4 py-3 justify-center sm:justify-start">
      <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
      </div>
      <div>
        <div className="text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-50 leading-none">
          {count}
          {suffix}
        </div>
        <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
          {label}
        </div>
      </div>
    </div>
  );
}

export default function TrustBadgeSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId: number;
    let scrollPos = 0;
    const speed = 0.4; // pixels per frame
    const containerWidth = el.scrollWidth / 2;

    const animate = () => {
      scrollPos += speed;
      if (scrollPos >= containerWidth) {
        scrollPos = 0;
      }
      el.scrollLeft = scrollPos;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    const handleMouseEnter = () => cancelAnimationFrame(animationId);
    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(animate);
    };

    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Double partners list for smooth infinite scrolling
  const scrollPartners = [...partners, ...partners];

  return (
    <section className="py-6 sm:py-8 bg-slate-50/50 dark:bg-gray-900/30 border-y border-gray-100 dark:border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:gap-6 lg:divide-x divide-gray-200/60 dark:divide-gray-800">
          {stats.map((stat, idx) => (
            <StatItem key={stat.label} {...stat} index={idx} />
          ))}
        </div>

        <div className="h-px bg-gray-200/60 dark:bg-gray-800 my-5 sm:my-6" />

        {/* Partners Carousel */}
        <div className="relative">
          {/* Fading borders */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-background dark:from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-background dark:from-background to-transparent z-10 pointer-events-none" />
          
          <div
            ref={scrollRef}
            className="overflow-x-auto scrollbar-hide flex items-center py-1.5"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex">
              {scrollPartners.map((partner, index) => (
                <div key={`${partner.initials}-${index}`} className="flex-shrink-0 mx-4 sm:mx-6 flex items-center gap-2 group">
                  <div className={`w-8 h-8 rounded-md ${partner.color} flex items-center justify-center shadow-sm text-white font-bold text-xs`}>
                    {partner.initials}
                  </div>
                  <span className="text-xs font-semibold text-gray-500 group-hover:text-emerald-700 dark:text-gray-400 transition-colors">
                    {partner.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
