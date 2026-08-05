"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lightbulb, Sun, Zap, BatteryMedium, ArrowRight, Check,
  Award, Shield, ExternalLink, Settings, ShieldCheck, HelpCircle
} from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { buildSpokeUrl } from "@/lib/utils/url";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/shared/Tooltip";
import SubpageHero from "@/components/shared/SubpageHero";

const productSegments = [
  {
    id: "pju",
    spoke: "pju",
    title: "Penerangan Jalan Umum Tenaga Surya",
    subtitle: "PJUTS All-in-One, Two-in-One, & Smart PJU IoT",
    icon: Lightbulb,
    gradient: "from-emerald-600 to-teal-700",
    bgIcon: "bg-emerald-50 dark:bg-emerald-950/40",
    colorIcon: "text-emerald-700 dark:text-emerald-400",
    description: "Sistem penerangan jalan umum bertenaga surya modular. Mengintegrasikan teknologi efisiensi tinggi, pencahayaan pintar IoT, dan baterai lithium cerdas untuk area perkotaan hingga pedesaan.",
    features: [
      "Lampu LED PJU 40W hingga 200W",
      "PJU Tenaga Surya All-in-One terintegrasi",
      "PJU Tenaga Surya Split/Two-in-One fleksibel",
      "Smart PJU IoT untuk monitoring daya real-time"
    ],
    badges: ["SNI Certified", "TKDN 40% - 60%", "e-Katalog LKPP"],
    specs: [
      { label: "Daya Output", value: "40W – 200W" },
      { label: "Tingkat Kecerahan", value: "4.000 – 24.000 lm" },
      { label: "Proteksi Fisik", value: "IP66 / IK08 Waterproof" },
      { label: "Kepatuhan Regulasi", value: "SNI 8513:2021" }
    ]
  },
  {
    id: "panel-surya",
    spoke: "solarcell",
    title: "Modul Panel Surya",
    subtitle: "Solar Cell Photovoltaic Monocrystalline & Polycrystalline",
    icon: Sun,
    gradient: "from-amber-500 to-orange-600",
    bgIcon: "bg-amber-50 dark:bg-amber-950/40",
    colorIcon: "text-amber-700 dark:text-amber-400",
    description: "Modul sel surya fotovoltaik berkinerja tinggi. Dirancang untuk konversi energi maksimum dalam iklim tropis Indonesia, baik untuk instalasi atap perumahan maupun PLTS industri skala besar.",
    features: [
      "Monocrystalline efisiensi sel tinggi (350W - 550W)",
      "Polycrystalline ekonomis & andal (300W - 450W)",
      "Panel Surya tipe Bifacial (penyerapan dua sisi)",
      "Toleransi daya positif & garansi performa 25 tahun"
    ],
    badges: ["SNI IEC 61215", "TKDN Compliance", "TÜV Certified"],
    specs: [
      { label: "Daya Maksimal", value: "350Wp – 550Wp" },
      { label: "Efisiensi Konversi", value: "Sampai dengan 22%" },
      { label: "Berat Modul", value: "21 – 27 kg" },
      { label: "Garansi Output", value: "25 Tahun Performa" }
    ]
  },
  {
    id: "penangkal-petir",
    spoke: "alatpetir",
    title: "Proteksi Penangkal Petir",
    subtitle: "Sistem Proteksi Sambaran Petir Radius Eksternal & Internal",
    icon: Zap,
    gradient: "from-teal-600 to-emerald-700",
    bgIcon: "bg-teal-50 dark:bg-teal-950/40",
    colorIcon: "text-teal-700 dark:text-teal-400",
    description: "Sistem proteksi petir elektrostatis dan konvensional terintegrasi. Melindungi gedung perkantoran, kawasan industri, dan fasilitas infrastruktur penting dari bahaya induksi sambaran petir.",
    features: [
      "Penangkal Petir Elektrostatis Radius (Radius 45m - 150m)",
      "Penangkal Petir Konvensional / Franklin Rod",
      "Surge Arrester internal untuk perlindungan jaringan listrik",
      "Grounding system dengan nilai resistansi rendah (< 2 Ohm)"
    ],
    badges: ["SNI IEC 62305", "Poli Sertifikat Uji", "Radius Proteksi"],
    specs: [
      { label: "Radius Proteksi", value: "45m – 150m" },
      { label: "Material Konduktor", value: "Tembaga Murni / Stainless" },
      { label: "Resistansi Tanah", value: "< 2 Ohm (Grounding)" },
      { label: "Standar Keamanan", value: "IEC 62305 & NF C 17-102" }
    ]
  },
  {
    id: "baterai",
    spoke: "baterai",
    title: "Baterai Storage",
    subtitle: "Baterai Penyimpanan Energi Lithium LiFePO4 & Gel Deep Cycle",
    icon: BatteryMedium,
    gradient: "from-emerald-500 to-teal-600",
    bgIcon: "bg-emerald-50 dark:bg-emerald-950/40",
    colorIcon: "text-emerald-700 dark:text-emerald-400",
    description: "Solusi penyimpanan daya listrik bersiklus tinggi (deep cycle). Sangat cocok untuk off-grid system PLTS, cadangan UPS industri, dan sistem penyimpanan baterai (BESS) skala mikrogrid.",
    features: [
      "Baterai Lithium LiFePO4 dengan Smart BMS terintegrasi",
      "Baterai Gel / AGM Deep Cycle andal",
      "Battery Energy Storage System (BESS) skala utilitas",
      "Desain modular untuk ekspansi kapasitas yang mudah"
    ],
    badges: ["SNI IEC 62619", "UN38.3 Safety", "Smart BMS"],
    specs: [
      { label: "Tipe Baterai", value: "LiFePO4 / Gel Deep Cycle" },
      { label: "Tegangan Kerja", value: "12V / 24V / 48V / High Volt" },
      { label: "Siklus Hidup", value: "3.000 – 6.000 Siklus" },
      { label: "Kapasitas Baterai", value: "50Ah – 500Ah per modul" }
    ]
  }
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 pb-20">
      
      <SubpageHero
        title="Katalog Produk & Solusi Infrastruktur"
        subtitle="Empat pilar solusi teknologi energi terbarukan dan kelistrikan untuk mendukung proyek pembangunan nasional Anda."
        badgeLabel="Portofolio Produk"
        badgeIconName="award"
      />

      {/* Product Segments Grid List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="space-y-12">
          {productSegments.map((segment, index) => {
            const SpokeIcon = segment.icon;
            // Build dynamic spoke URL based on active host
            const subdomainUrl = buildSpokeUrl(segment.spoke, "/products");

            return (
              <ScrollReveal key={segment.id} delay={index * 0.05}>
                <Card className="border-emerald-100 dark:border-emerald-800/40 shadow-sm bg-white dark:bg-gray-900 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <div className={`h-1.5 bg-gradient-to-r ${segment.gradient}`} />
                  <CardContent className="p-6 sm:p-8">
                    <div className="grid lg:grid-cols-3 gap-8 items-start">
                      
                      {/* Left: Info details */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl ${segment.bgIcon} flex items-center justify-center shrink-0`}>
                            <SpokeIcon className={`w-7 h-7 ${segment.colorIcon}`} />
                          </div>
                          <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                              {segment.title}
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{segment.subtitle}</p>
                          </div>
                        </div>

                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                          {segment.description}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-1">
                          {segment.badges.map((b) => (
                            <span key={b} className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                              {b}
                            </span>
                          ))}
                        </div>

                        {/* Features List Checklist */}
                        <div className="space-y-3 pt-2">
                          <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">Fitur Unggulan</h4>
                          <ul className="grid sm:grid-cols-2 gap-2.5">
                            {segment.features.map((feature) => (
                              <li key={feature} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                                <div className="w-5 h-5 rounded-full bg-emerald-100/60 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center shrink-0 mt-0.5">
                                  <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                                </div>
                                <span className="leading-snug">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Right: Quick Specs & Dynamic CTA Link */}
                      <div className="bg-slate-50 dark:bg-gray-950 p-6 rounded-2xl border border-emerald-50/50 dark:border-gray-800 space-y-6">
                        <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">Quick Specifications</h4>
                        <div className="rounded-xl border border-emerald-100/60 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
                          <table className="w-full text-xs">
                            <tbody>
                              {segment.specs.map((spec, i) => (
                                <tr key={spec.label} className={i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-emerald-50/30 dark:bg-emerald-950/20"}>
                                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-semibold">{spec.label}</td>
                                  <td className="px-4 py-3 text-emerald-900 dark:text-emerald-200 font-bold text-right">{spec.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* CTA with dynamic domain warning tooltip */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-full">
                                <Link
                                  href={subdomainUrl}
                                  className="flex items-center justify-center w-full bg-emerald-700 hover:bg-emerald-800 text-white min-h-[48px] rounded-xl text-sm font-bold shadow-sm transition cursor-pointer"
                                >
                                  Kunjungi Portal {segment.id === 'pju' ? 'PJUTS' : segment.id === 'panel-surya' ? 'Panel Surya' : segment.id === 'penangkal-petir' ? 'Penangkal Petir' : 'Baterai'}
                                  <ExternalLink className="w-4 h-4 ml-2" />
                                </Link>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-emerald-900 text-white border border-emerald-800">
                              <p className="text-xs">Anda akan diarahkan ke portal subdomain khusus produk {segment.title}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Comparative Specifications Matrix Section */}
        <ScrollReveal delay={0.2}>
          <div className="mt-16 space-y-6">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 mb-3 px-3 py-1">
                <Settings className="w-3.5 h-3.5 mr-1.5" />Bandingkan
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                Tabel Perbandingan Spesifikasi
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Analisis perbandingan spesifikasi dasar dari 4 lini produk utama PT. Daya Berkah Sentosa Nusantara (DBSN).
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100/60 dark:border-gray-800 overflow-hidden shadow-sm bg-white dark:bg-gray-900">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="bg-emerald-700 dark:bg-emerald-800 text-white text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 text-left font-bold">Kriteria Perbandingan</th>
                      <th className="px-6 py-4 text-center font-bold">PJUTS (Penerangan Jalan)</th>
                      <th className="px-6 py-4 text-center font-bold">Panel Surya (PLTS)</th>
                      <th className="px-6 py-4 text-center font-bold">Penangkal Petir (Proteksi)</th>
                      <th className="px-6 py-4 text-center font-bold">Baterai Storage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-50/60 dark:divide-gray-800">
                    {[
                      {
                        kriteria: "Aplikasi Utama",
                        pju: "Penerangan jalan raya, tambang, perumahan",
                        solar: "Pembangkit listrik atap (on-grid/off-grid)",
                        petir: "Gedung, pabrik, area industri luar ruangan",
                        baterai: "Backup UPS, sistem penyimpanan PLTS, mikrogrid"
                      },
                      {
                        kriteria: "Sertifikasi Utama",
                        pju: "SNI 8513:2021, TKDN 40%-60%, e-Katalog",
                        solar: "SNI IEC 61215, TKDN, TÜV Rheinland",
                        petir: "SNI IEC 62305, NF C 17-102",
                        baterai: "SNI IEC 62619, UN38.3 Safety Standard"
                      },
                      {
                        kriteria: "Masa Berlaku / Lifespan",
                        pju: "LED 50.000 jam, Baterai 5-8 tahun",
                        solar: "Garansi performa output 25 tahun",
                        petir: "Hingga 10-15 tahun pemakaian luar ruang",
                        baterai: "3.000 – 6.000 siklus (5-10 tahun)"
                      },
                      {
                        kriteria: "Radius Proteksi / Kapasitas Baterai",
                        pju: "N/A",
                        solar: "N/A",
                        petir: "Radius proteksi 45 meter - 150 meter",
                        baterai: "Kapasitas 50Ah – 500Ah per modul penyimpanan"
                      },
                      {
                        kriteria: "Rentang Kapasitas Daya",
                        pju: "Daya lampu 40W – 200W",
                        solar: "Kapasitas modul 350Wp – 550Wp",
                        petir: "N/A",
                        baterai: "Tegangan 12V / 24V / 48V"
                      }
                    ].map((row, i) => (
                      <tr key={row.kriteria} className={i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-emerald-50/20 dark:bg-emerald-950/20"}>
                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-emerald-300 text-xs">{row.kriteria}</td>
                        <td className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300">{row.pju}</td>
                        <td className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300">{row.solar}</td>
                        <td className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300">{row.petir}</td>
                        <td className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300">{row.baterai}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ScrollReveal>

      </main>
    </div>
  );
}
