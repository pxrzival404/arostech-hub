"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Package, ArrowRight, Shield, Award, ClipboardCheck, FileCheck } from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { useCounter } from "@/hooks/use-counter";

const trustBadges = [
  { label: "SNI", icon: Shield, desc: "Standar Nasional Indonesia" },
  { label: "TKDN", icon: Award, desc: "Tingkat Komponen Dalam Negeri" },
  { label: "LKPP", icon: ClipboardCheck, desc: "Lembaga Kebijakan Pengadaan" },
  { label: "ISO", icon: FileCheck, desc: "International Organization for Standardization" },
];

const stats = [
  { value: 500, suffix: "+", label: "Proyek Selesai" },
  { value: 15, suffix: "+", label: "Tahun Pengalaman" },
  { value: 30, suffix: "+", label: "Kota Terlayani" },
];

function StatCounter({ value, suffix }: { value: number; suffix: string }) {
  const count = useCounter(value, 2000, true);
  return <span>{count}{suffix}</span>;
}

export default function HeroSection() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="beranda" className="relative pt-28 md:pt-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bg.png"
          alt="DBSN Dayaberkah.id - Solusi Energi Indonesia"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-black/60 dark:bg-black/70" />
      <div className="absolute inset-0 hero-gradient opacity-60" />
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Floating decorative elements */}
      <div className="absolute top-32 left-[10%] w-16 h-16 rounded-full bg-emerald-300/10 blur-sm float-animation pointer-events-none" />
      <div className="absolute top-48 right-[15%] w-12 h-12 rounded-full bg-amber-300/12 blur-sm float-animation-delay pointer-events-none" />
      <div className="absolute bottom-32 left-[20%] w-10 h-10 rounded-full bg-emerald-400/8 blur-sm float-animation-delay pointer-events-none" />
      <div className="absolute bottom-48 right-[10%] w-14 h-14 rounded-full bg-amber-400/10 blur-sm float-animation pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <ScrollReveal delay={0}>
                <Badge variant="outline" className="border-emerald-300/50 bg-emerald-500/20 text-emerald-200 px-3 py-1 text-sm">
                  Penyedia Solusi Energi & Infrastruktur
                </Badge>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg [text-shadow:0_2px_30px_rgba(0,0,0,0.6)]">
                  Solusi Energi &{" "}
                  <span className="text-emerald-400">Infrastruktur</span>
                  {" "}Terpercaya untuk Indonesia
                </h1>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <p className="text-lg sm:text-xl text-white/80 max-w-xl leading-relaxed drop-shadow-md">
                  DBSN Dayaberkah.id hadir sebagai mitra terpercaya untuk solusi
                  penerangan jalan umum, panel surya, penangkal petir, dan sistem
                  penyimpanan energi. Bersertifikasi SNI, TKDN, LKPP, dan ISO.
                </p>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.3}>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => scrollTo("permintaan-penawaran")}
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 min-h-[48px] text-base px-6 shadow-xl shadow-emerald-600/40 transition-all duration-300"
                >
                  <FileText className="w-5 h-5" />
                  Ajukan Penawaran
                </Button>
                <Button
                  onClick={() => scrollTo("produk")}
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-white/40 text-white hover:bg-white/10 gap-2 min-h-[48px] text-base px-6 backdrop-blur-sm"
                >
                  <Package className="w-5 h-5" />
                  Lihat Produk
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="relative group bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-5 sm:px-5 sm:py-5 text-center hover:bg-white/15 hover:border-white/30 transition-all duration-300"
                  >
                    <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
                      <StatCounter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-xs sm:text-sm text-gray-300 mt-1 leading-tight">{stat.label}</div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Right Visual */}
          <div className="hidden lg:block relative">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm float-animation" style={{ animationDuration: "8s" }} />
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm float-animation" style={{ animationDuration: "6s", animationDelay: "1s" }} />
              <div className="absolute inset-16 rounded-full bg-gradient-to-br from-emerald-400/20 to-white/10 backdrop-blur-sm flex items-center justify-center float-animation" style={{ animationDuration: "5s", animationDelay: "2s" }}>
                <div className="text-center space-y-3 p-8">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto shadow-lg ring-4 ring-emerald-400/20 bg-white flex items-center justify-center">
                    <Image
                      src="/images/dbsn_logo.png"
                      alt="DBSN Dayaberkah.id"
                      width={80}
                      height={80}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white drop-shadow-md">DBSN</p>
                    <p className="text-sm text-emerald-200">Dayaberkah.id</p>
                  </div>
                </div>
              </div>
              <div className="absolute top-8 -right-4 glass-card rounded-xl p-3 float-animation" style={{ animationDuration: "6s" }}>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">SNI Certified</span>
                </div>
              </div>
              <div className="absolute bottom-12 -left-4 glass-card rounded-xl p-3 float-animation-delay">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-700">TKDN Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges Bar */}
        <div className="mt-16 lg:mt-20">
          <div className="bg-white/5 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 dark:border-white/5 shadow-2xl p-4 sm:p-6">
            <p className="text-center text-sm text-emerald-300/80 mb-4 font-semibold tracking-wider uppercase">
              Bersertifikasi & Terverifikasi
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {trustBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all duration-300 group min-h-[44px]"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <badge.icon className="w-6 h-6 text-emerald-400 dark:text-emerald-300" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-white group-hover:text-emerald-300 transition-colors text-sm sm:text-base">{badge.label}</p>
                    <p className="text-[11px] sm:text-xs text-emerald-100/60 group-hover:text-emerald-100/80 transition-colors mt-0.5 hidden sm:block leading-tight">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <button
          onClick={() => scrollTo("tentang-kami")}
          className="flex flex-col items-center gap-1 group cursor-pointer"
          aria-label="Gulir ke bawah"
        >
          <span className="text-xs text-white/40 group-hover:text-white/90 transition-colors">Gulir ke bawah</span>
          <div className="w-7 h-11 rounded-full border-2 border-white/40 group-hover:border-white/70 transition-colors flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 rounded-full bg-white/80 bounce-down" />
          </div>
        </button>
      </div>
    </section>
  );
}
