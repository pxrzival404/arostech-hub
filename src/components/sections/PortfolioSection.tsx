"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  MapPin, Building2, Calendar, Wrench, ArrowRight,
  FileText, ChevronLeft, ChevronRight, BarChart3, Lightbulb, Palmtree, Navigation, Layers
} from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { useCounter } from "@/hooks/use-counter";
import ProjectMapDynamic from "@/components/project-map-dynamic";

export interface PortfolioItem {
  id: string;
  title: string;
  clientCategory: string;
  location: string;
  completionYear: number;
  scopeDescription: string;
  outcome: string;
  images: string | null;
  relatedSpoke: string | null;
  image?: string;
}

interface PortfolioSectionProps {
  portfolioItems?: PortfolioItem[];
}

const defaultPortfolioItems: PortfolioItem[] = [
  { id: "p1", title: "Pemasangan PJU LED Jalan Tol Trans Jawa", clientCategory: "Government", location: "Semarang, Jawa Tengah", completionYear: 2024, scopeDescription: "Pemasangan 500 unit PJU LED 200W sepanjang ruas tol Semarang-Solo", outcome: "Peningkatan visibilitas jalan tol dan penurunan kecelakaan malam hari hingga 35%", images: null, relatedSpoke: "PJU", image: "/images/portfolio-pju-highway.png" },
  { id: "p2", title: "Pembangkit Listrik Tenaga Surya PLTS Roofmount", clientCategory: "BUMN", location: "Jakarta Selatan, DKI Jakarta", completionYear: 2024, scopeDescription: "Instalasi PLTS atap 500 kWp untuk kantor pusat BUMN", outcome: "Penghematan biaya listrik hingga 40% per tahun, setara 600 ton CO2", images: null, relatedSpoke: "Panel Surya", image: "/images/portfolio-solar-rooftop.png" },
  { id: "p3", title: "Sistem Penangkal Petir Gedung Perkantoran", clientCategory: "Private", location: "Surabaya, Jawa Timur", completionYear: 2023, scopeDescription: "Instalasi sistem proteksi petir radius 150m pada gedung 25 lantai", outcome: "Perlindungan menyeluruh sesuai standar SNI IEC 62305", images: null, relatedSpoke: "Penangkal Petir", image: "/images/portfolio-petir-building.png" },
  { id: "p4", title: "Pengadaan PJU Tenaga Surya 34 Provinsi", clientCategory: "Government", location: "Nasional (34 Provinsi)", completionYear: 2023, scopeDescription: "Pengadaan dan instalasi 3.000 unit PJU tenaga surya untuk daerah 3T", outcome: "Penerangan jalan untuk 150 desa yang belum memiliki akses listrik PLN", images: null, relatedSpoke: "PJU" },
  { id: "p5", title: "Battery Energy Storage System (BESS) Microgrid", clientCategory: "BUMN", location: "Bali", completionYear: 2024, scopeDescription: "Pemasangan BESS 2 MWh untuk stabilisasi jaringan microgrid pulau", outcome: "Stabilitas jaringan meningkat 60%, mendukung program Bali Mandiri Energi", images: null, relatedSpoke: "Baterai" },
  { id: "p6", title: "Sistem PJU Smart City Terintegrasi IoT", clientCategory: "EPC", location: "Makassar, Sulawesi Selatan", completionYear: 2023, scopeDescription: "Instalasi 200 unit PJU smart dengan sensor IoT untuk monitoring pemakaian", outcome: "Efisiensi energi meningkat 50% dengan sistem dimming otomatis", images: null, relatedSpoke: "PJU" },
  { id: "p7", title: "Grounding System Pabrik Manufaktur", clientCategory: "Private", location: "Bekasi, Jawa Barat", completionYear: 2024, scopeDescription: "Instalasi sistem grounding dan penangkal petir untuk area pabrik 5 hektar", outcome: "Memenuhi standar keamanan listrik dan proteksi petir pabrik", images: null, relatedSpoke: "Penangkal Petir" },
  { id: "p8", title: "PLTS Groundmount Kawasan Industri", clientCategory: "EPC", location: "Cikarang, Jawa Barat", completionYear: 2024, scopeDescription: "Pembangunan PLTS groundmount 2 MWp untuk kawasan industri", outcome: "Menyediakan energi bersih untuk 200 unit pabrik di kawasan", images: null, relatedSpoke: "Panel Surya" },
  { id: "p9", title: "Pengadaan Baterai UPS Data Center Pemerintah", clientCategory: "Government", location: "Bandung, Jawa Barat", completionYear: 2023, scopeDescription: "Pengadaan dan instalasi sistem baterai UPS 500 kVA untuk data center", outcome: "Backup power 24 jam untuk data center pemerintah kritis", images: null, relatedSpoke: "Baterai" },
  { id: "p10", title: "Pemasangan PJU Solar Home System", clientCategory: "BUMN", location: "Kalimantan Timur", completionYear: 2024, scopeDescription: "Pemasangan 1.000 unit PJU solar home system untuk perumahan karyawan", outcome: "Mengurangi ketergantungan genset dan emisi CO2 sebesar 200 ton/tahun", images: null, relatedSpoke: "PJU" },
  { id: "p11", title: "Sistem Proteksi Petir Bandara", clientCategory: "EPC", location: "Medan, Sumatera Utara", completionYear: 2023, scopeDescription: "Instalasi sistem proteksi petir untuk terminal bandara dan menara kontrol", outcome: "Perlindungan komprehensif sesuai standar ICAO dan SNI", images: null, relatedSpoke: "Penangkal Petir" },
  { id: "p12", title: "Pengadaan Baterai untuk Sistem PLTS Desa", clientCategory: "Government", location: "NTT (Nusa Tenggara Timur)", completionYear: 2024, scopeDescription: "Pengadaan baterai LiFePO4 untuk 50 unit PLTS desa terpencil", outcome: "Penyimpanan energi untuk 50 desa, melayani 5.000 kepala keluarga", images: null, relatedSpoke: "Baterai" },
];

const cityCards = [
  { city: "Jakarta", province: "DKI Jakarta", projects: 50, productType: "PJU LED, Panel Surya" },
  { city: "Surabaya", province: "Jawa Timur", projects: 45, productType: "PJU Tenaga Surya, Penangkal Petir" },
  { city: "Bandung", province: "Jawa Barat", projects: 25, productType: "Panel Surya, Baterai LiFePO4" },
  { city: "Semarang", province: "Jawa Tengah", projects: 20, productType: "PJU LED, Penangkal Petir" },
  { city: "Medan", province: "Sumatera Utara", projects: 15, productType: "PJU Tenaga Surya, Panel Surya" },
  { city: "Makassar", province: "Sulawesi Selatan", projects: 15, productType: "PJU LED, Baterai LiFePO4" },
  { city: "Denpasar", province: "Bali", projects: 10, productType: "PJU Tenaga Surya, Penangkal Petir" },
  { city: "Yogyakarta", province: "DI Yogyakarta", projects: 10, productType: "Panel Surya, PJU LED" },
];

const filters = [
  { key: "all", label: "Semua" },
  { key: "Government", label: "Pemerintah" },
  { key: "BUMN", label: "BUMN" },
  { key: "Private", label: "Swasta" },
  { key: "EPC", label: "EPC" },
];

const categoryColors: Record<string, string> = {
  Government: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900",
  BUMN: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900",
  Private: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-900",
  EPC: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-900",
};

const categoryAccentColors: Record<string, string> = {
  Government: "bg-emerald-600", BUMN: "bg-amber-600", Private: "bg-blue-600", EPC: "bg-purple-600",
};

const categoryLabels: Record<string, string> = {
  Government: "Pemerintah", BUMN: "BUMN", Private: "Swasta", EPC: "EPC",
};

function StatBox({ icon: Icon, value, suffix, label }: any) {
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

  const count = useCounter(value, 2000, inView);

  return (
    <div ref={ref} className="text-center p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-md transition-all duration-300">
      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-2">
        <Icon className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
      </div>
      <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 leading-tight">
        {count}{suffix}
      </div>
      <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
        {label}
      </div>
    </div>
  );
}

export default function PortfolioSection({ portfolioItems = defaultPortfolioItems }: PortfolioSectionProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const filtered = activeFilter === "all" ? portfolioItems : portfolioItems.filter((item) => item.clientCategory === activeFilter);

  // Embla Carousel Integration
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback((emblaApi: any) => {
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  // Re-initialize Embla snaps when filter changes
  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [filtered, emblaApi]);

  return (
    <section id="portofolio" className="py-12 sm:py-16 lg:py-20 bg-slate-50 dark:bg-gray-950 divide-y divide-gray-200/60 dark:divide-gray-800">
      
      {/* Sub-section A: Jangkauan Proyek (Top) */}
      <div className="pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal delay={0}>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 mb-4">
              <MapPin className="w-3.5 h-3.5 mr-1.5" />Jangkauan
            </Badge>
            <h2 className="section-heading">Jangkauan Proyek</h2>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
              Mitra terpercaya kelistrikan dan energi terbarukan di lebih dari 30 kota di seluruh pelosok Indonesia
            </p>
          </div>
        </ScrollReveal>

        {/* Stats counters recap */}
        <ScrollReveal delay={0.05}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mb-10">
            <StatBox icon={Building2} value={500} suffix="+" label="Proyek Selesai" />
            <StatBox icon={MapPin} value={30} suffix="+" label="Kota Terlayani" />
            <StatBox icon={Calendar} value={15} suffix="+" label="Tahun Pengalaman" />
            <StatBox icon={Palmtree} value={12} suffix="+" label="Pulau Terjangkau" />
          </div>
        </ScrollReveal>

        {/* Map view */}
        <ScrollReveal delay={0.1}>
          <div className="relative max-w-5xl mx-auto">
            <ProjectMapDynamic />

            {/* Map Info Overlay - Top Left */}
            <div className="absolute top-4 left-4 z-[1000] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl border border-emerald-200 dark:border-emerald-800/60 shadow-md px-4 py-3 hidden sm:block">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                  <Navigation className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-semibold text-emerald-900 dark:text-emerald-100 text-xs">
                  Peta Proyek DBSN
                </span>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">
                Klik marker untuk melihat detail sebaran proyek
              </p>
            </div>

            {/* Legend - Bottom */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-5">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 border-2 border-white shadow-sm" />
                Lokasi Proyek
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Layers className="w-3.5 h-3.5" />
                OpenStreetMap Contributors
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* City cards breakdown */}
        <ScrollReveal delay={0.15}>
          <div className="mt-12">
            <h3 className="text-center text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 mb-6">
              Sebaran Proyek di Kota Utama
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {cityCards.map((card, index) => (
                <div key={card.city} className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-amber-400 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h4 className="font-bold text-emerald-950 dark:text-emerald-100 text-sm group-hover:text-emerald-700 transition-colors">
                      {card.city}
                    </h4>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-2">{card.province}</p>
                  <div className="flex items-baseline gap-1 text-xs mb-2">
                    <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">{card.projects}+</span>
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Proyek</span>
                  </div>
                  <div className="text-[9px] font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 rounded px-1.5 py-0.5 truncate">
                    {card.productType}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Sub-section B: Portofolio Proyek (Bottom) */}
      <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal delay={0}>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 mb-4">
              <Building2 className="w-3.5 h-3.5 mr-1.5" />Galeri
            </Badge>
            <h2 className="section-heading">Portofolio Proyek</h2>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
              Telusuri dokumentasi detail proyek instalasi ketenagalistrikan yang telah kami rampungkan
            </p>
            <div className="mt-4 inline-flex">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                Menampilkan {filtered.length} dari {portfolioItems.length} Proyek
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Filter Chips */}
        <ScrollReveal delay={0.05}>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {filters.map((f) => (
              <Button key={f.key} variant={activeFilter === f.key ? "default" : "outline"} onClick={() => setActiveFilter(f.key)}
                className={activeFilter === f.key ? "bg-emerald-700 hover:bg-emerald-800 text-white min-h-[44px] px-4 text-sm font-semibold shadow-sm" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-900/20 min-h-[44px] px-4 text-sm font-semibold"}>
                {f.label}
              </Button>
            ))}
          </div>
        </ScrollReveal>

        {/* Horizontal Carousel Wrapper */}
        <ScrollReveal delay={0.1} className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6 pb-4">
              {filtered.map((item, index) => (
                <div key={item.id} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 h-full">
                  <Card className="border-emerald-100 dark:border-emerald-800/50 shadow-sm hover:shadow-md hover:scale-[1.01] hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 group overflow-hidden cursor-pointer rounded-xl h-full flex flex-col justify-between" onClick={() => setSelectedItem(item)}>
                    <div className="aspect-video bg-gradient-to-br from-emerald-100 via-emerald-50 to-amber-50 dark:from-emerald-950/20 dark:via-emerald-900/10 dark:to-amber-900/10 relative overflow-hidden shrink-0">
                      <div className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-emerald-600/90 text-white text-xs font-bold flex items-center justify-center shadow-md">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      {item.image ? (
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Building2 className="w-10 h-10 text-emerald-300 dark:text-emerald-700" />
                        </div>
                      )}
                      <Badge className={`absolute top-3 left-14 ${categoryColors[item.clientCategory]}`}>
                        {categoryLabels[item.clientCategory]}
                      </Badge>
                      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <MapPin className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                      </div>
                    </div>
                    <CardContent className="p-5 flex flex-col flex-1 justify-between gap-4">
                      <div className="space-y-2">
                        <h4 className="font-bold text-emerald-950 dark:text-emerald-100 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                          {item.title}
                        </h4>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                            <span className="truncate">{item.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                            <span>Tahun {item.completionYear}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Wrench className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                            <span className="truncate">{item.relatedSpoke || "Kelistrikan / Energi"}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" className="w-full text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20 text-xs gap-1.5 min-h-[44px] mt-auto">
                        Lihat Detail <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls (Desktop) */}
          <div className="hidden sm:flex items-center justify-between absolute top-1/2 -translate-y-1/2 -left-4 -right-4 pointer-events-none w-[calc(100%+32px)]">
            <Button
              variant="outline"
              size="icon"
              className={`w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all pointer-events-auto min-h-[40px] ${!prevBtnEnabled ? 'opacity-40 cursor-not-allowed' : 'opacity-100 hover:scale-105'}`}
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
              aria-label="Slide sebelumnya"
            >
              <ChevronLeft className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={`w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all pointer-events-auto min-h-[40px] ${!nextBtnEnabled ? 'opacity-40 cursor-not-allowed' : 'opacity-100 hover:scale-105'}`}
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
              aria-label="Slide berikutnya"
            >
              <ChevronRight className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            </Button>
          </div>
        </ScrollReveal>

        {/* Dialog Details */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          {selectedItem && (
            <DialogContent className="max-w-lg p-0 overflow-hidden">
              <div className={`h-1.5 ${categoryAccentColors[selectedItem.clientCategory]}`} />
              {selectedItem.image && (
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image src={selectedItem.image} alt={selectedItem.title} fill className="object-cover" />
                  <Badge className={`absolute top-3 left-3 ${categoryColors[selectedItem.clientCategory]}`}>
                    {categoryLabels[selectedItem.clientCategory]}
                  </Badge>
                </div>
              )}
              <div className="p-6">
                <DialogHeader>
                  {!selectedItem.image && (
                    <Badge className={`w-fit ${categoryColors[selectedItem.clientCategory]} mb-2`}>
                      {categoryLabels[selectedItem.clientCategory]}
                    </Badge>
                  )}
                  <DialogTitle className="text-emerald-900 dark:text-emerald-100 text-lg sm:text-xl font-bold leading-tight">
                    {selectedItem.title}
                  </DialogTitle>
                  <DialogDescription className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-500 mt-1.5">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-600" />{selectedItem.location}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-emerald-600" />Tahun {selectedItem.completionYear}</span>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4 text-sm leading-relaxed">
                  <div>
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-400 text-xs sm:text-sm mb-1">Lingkup Pekerjaan</h4>
                    <p className="text-gray-600 dark:text-gray-300">{selectedItem.scopeDescription}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-400 text-xs sm:text-sm mb-1">Hasil & Dampak</h4>
                    <p className="text-gray-600 dark:text-gray-300">{selectedItem.outcome}</p>
                  </div>
                  {selectedItem.relatedSpoke && (
                    <Badge variant="outline" className="border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400">
                      <Wrench className="w-3.5 h-3.5 mr-1" />{selectedItem.relatedSpoke}
                    </Badge>
                  )}
                  <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white gap-2 min-h-[48px] mt-2 font-semibold"
                    onClick={() => { setSelectedItem(null); setTimeout(() => { document.getElementById("permintaan-penawaran")?.scrollIntoView({ behavior: "smooth" }); }, 300); }}>
                    <FileText className="w-4 h-4" />Ajukan Penawaran Serupa
                  </Button>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>

    </section>
  );
}
