"use client";

import { useState } from "react";
import Image from "next/image";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb, Sun, Zap, BatteryMedium, ArrowRight, Check,
  MessageSquare, Shield, Award, Wrench, Truck, LayoutGrid, Table2,
} from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { useCounter } from "@/hooks/use-counter";

const productImages: Record<string, string> = {
  "pju": "/images/product-pju.png",
  "panel-surya": "/images/product-solar.png",
  "penangkal-petir": "/images/product-petir.png",
  "baterai": "/images/product-baterai.png",
};

const products = [
  {
    id: "pju", title: "Penerangan Jalan Umum", subtitle: "PJU Tenaga Surya & LED", icon: Lightbulb,
    description: "Sistem penerangan jalan umum LED dan PJU tenaga surya berkualitas tinggi. Tersedia dalam berbagai kapasitas dan spesifikasi sesuai kebutuhan proyek Anda.",
    fullDescription: "Kami menyediakan rangkaian lengkap sistem Penerangan Jalan Umum (PJU) mulai dari PJU LED konvensional, PJU Tenaga Surya All-in-One, hingga PJU Smart dengan teknologi IoT. Semua produk kami telah tersertifikasi SNI dan memenuhi standar kualitas nasional.",
    features: ["PJU LED 40W - 200W", "PJU Tenaga Surya All-in-One", "PJU Tenaga Surya Split", "Smart PJU dengan IoT"],
    productCount: "45+", gradient: "from-emerald-500 to-emerald-700", iconBg: "bg-emerald-100", iconColor: "text-emerald-700", sheetAccent: "bg-emerald-600",
  },
  {
    id: "panel-surya", title: "Panel Surya", subtitle: "Solar Cell & Photovoltaic", icon: Sun,
    description: "Modul panel surya fotovoltaik berkualitas tinggi dengan efisiensi optimal. Cocok untuk pembangkit listrik skala rumah tangga hingga industri besar.",
    fullDescription: "Panel surya fotovoltaik kami tersedia dalam teknologi Monocrystalline dan Polycrystalline dengan efisiensi tinggi. Produk kami cocok untuk berbagai aplikasi mulai dari PLTS Roofmount, PLTS Groundmount, hingga PLTS Off-grid untuk daerah terpencil.",
    features: ["Monocrystalline 350W - 550W", "Polycrystalline 300W - 450W", "Bifacial Panel Surya", "Flexible Solar Panel"],
    productCount: "30+", gradient: "from-amber-500 to-amber-700", iconBg: "bg-amber-100", iconColor: "text-amber-700", sheetAccent: "bg-amber-600",
  },
  {
    id: "penangkal-petir", title: "Penangkal Petir", subtitle: "Lightning Protection System", icon: Zap,
    description: "Sistem proteksi petir terpadu sesuai standar SNI dan IEC. Melindungi bangunan, infrastruktur, dan fasilitas dari sambaran petir.",
    fullDescription: "Sistem proteksi petir kami mencakup penangkal petir radius, penangkal petir konvensional, grounding system, dan surge arrester. Semua produk dirancang dan dipasang sesuai standar SNI IEC 62305.",
    features: ["Penangkal Petir Radius", "Penangkal Petir Konvensional", "Grounding System", "Surge Arrester"],
    productCount: "25+", gradient: "from-emerald-600 to-teal-700", iconBg: "bg-emerald-100", iconColor: "text-emerald-700", sheetAccent: "bg-emerald-600",
  },
  {
    id: "baterai", title: "Baterai", subtitle: "Battery & Power Storage", icon: BatteryMedium,
    description: "Sistem penyimpanan energi baterai untuk berbagai aplikasi. Dari UPS hingga battery energy storage system skala besar.",
    fullDescription: "Kami menyediakan solusi penyimpanan energi lengkap mulai dari baterai LiFePO4 untuk aplikasi tenaga surya, baterai Gel/AGM untuk UPS, hingga Battery Energy Storage System (BESS) skala besar untuk stabilisasi jaringan mikrogrid.",
    features: ["Baterai LiFePO4", "Baterai Gel/AGM", "Battery Energy Storage System", "UPS Industrial"],
    productCount: "20+", gradient: "from-amber-600 to-orange-700", iconBg: "bg-amber-100", iconColor: "text-amber-700", sheetAccent: "bg-amber-600",
  },
];

const whyChooseUs = [
  { icon: Shield, title: "Produk Bersertifikasi", desc: "SNI, TKDN, ISO", value: 4, suffix: "", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  { icon: Award, title: "Garansi Kualitas", desc: "Garansi produk resmi", value: 500, suffix: "+", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  { icon: Wrench, title: "Dukungan Teknis", desc: "Tim teknis profesional", value: 24, suffix: "/7", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  { icon: Truck, title: "Pengiriman Nasional", desc: "30+ kota di Indonesia", value: 30, suffix: "+", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
];

const productSpecs: Record<string, { label: string; value: string }[]> = {
  pju: [{ label: "Daya", value: "40W – 200W" }, { label: "Tegangan Input", value: "AC 170V – 265V" }, { label: "Luminous Flux", value: "4000 – 12000 lm" }, { label: "IP Rating", value: "IP65 / IP66" }, { label: "Sertifikasi", value: "SNI 8513:2021" }],
  "panel-surya": [{ label: "Tipe Sel", value: "Mono / Poly crystalline" }, { label: "Daya Maks", value: "350W – 550W" }, { label: "Efisiensi", value: "20% – 22%" }, { label: "Berat Modul", value: "21 – 27 kg" }, { label: "Garansi", value: "25 tahun performa" }],
  "penangkal-petir": [{ label: "Radius Proteksi", value: "45m – 150m" }, { label: "Standar", value: "SNI IEC 62305" }, { label: "Material", value: "Tembaga / Stainless Steel" }, { label: "Tahan Cuaca", value: "IP65" }, { label: "Garansi", value: "10 tahun" }],
  baterai: [{ label: "Tipe", value: "LiFePO4 / Gel / AGM" }, { label: "Kapasitas", value: "50Ah – 500Ah" }, { label: "Siklus Hidup", value: "3000 – 6000 cycle" }, { label: "Tegangan", value: "12V / 24V / 48V" }, { label: "Garansi", value: "3 – 5 tahun" }],
};

const comparisonData = [
  { spec: "Kategori", "pju": "Penerangan Jalan", "panel-surya": "Energi Terbarukan", "penangkal-petir": "Proteksi Petir", "baterai": "Penyimpanan Energi" },
  { spec: "Daya / Kapasitas", "pju": "40W – 200W", "panel-surya": "350W – 550W", "penangkal-petir": "Radius 45-150m", "baterai": "50Ah – 500Ah" },
  { spec: "Garansi", "pju": "3 – 5 Tahun", "panel-surya": "25 Tahun Performa", "penangkal-petir": "10 Tahun", "baterai": "3 – 5 Tahun" },
  { spec: "Sertifikasi", "pju": "SNI 8513:2021", "panel-surya": "SNI IEC 61215", "penangkal-petir": "SNI IEC 62305", "baterai": "SNI / IEC 62619" },
];

function WhyChooseCounter({ value, suffix }: { value: number; suffix: string }) {
  const count = useCounter(value, 2000, true);
  return <span>{count}{suffix}</span>;
}

type Product = typeof products[0];

function ProductDetailPanel({ product, onClose }: { product: Product; onClose: () => void }) {
  const scrollTo = (id: string) => {
    onClose();
    setTimeout(() => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); }, 300);
  };
  const WA_URL = "https://wa.me/6283112345678?text=Halo%20DBSN%20Dayaberkah.id";

  return (
    <DialogPrimitive.Root open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />
        <DialogPrimitive.Content className="fixed inset-0 z-50 flex items-end sm:items-center justify-center outline-none animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
          <div className="relative bg-white dark:bg-gray-900 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-2xl custom-scrollbar">
            <DialogPrimitive.Title className="sr-only">{product.title}</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Detail produk {product.title}
            </DialogPrimitive.Description>
            <div className={`h-1.5 ${product.sheetAccent} rounded-t-3xl sm:rounded-t-2xl`} />
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl ${product.iconBg} flex items-center justify-center shrink-0`}>
                  <product.icon className={`w-8 h-8 ${product.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-emerald-900 dark:text-emerald-100 text-xl font-bold">{product.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{product.subtitle}</p>
                </div>
                <DialogPrimitive.Close asChild>
                  <button className="ml-auto text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none" aria-label="Close product details">
                    &times;
                  </button>
                </DialogPrimitive.Close>
              </div>
              <div>
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm mb-2">Deskripsi Produk</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{product.fullDescription}</p>
              </div>
              <div>
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm mb-3">Fitur Unggulan</h4>
                <ul className="space-y-2.5">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-700 dark:text-emerald-300" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Badge variant="outline" className="border-emerald-200 text-emerald-700">{product.productCount} Varian Produk Tersedia</Badge>
              {productSpecs[product.id] && (
                <div>
                  <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm mb-3">Spesifikasi Teknis</h4>
                  <div className="rounded-lg border border-emerald-100 dark:border-emerald-800 overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody>
                        {productSpecs[product.id].map((spec, i) => (
                          <tr key={spec.label} className={i % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-emerald-50/40 dark:bg-emerald-900/20"}>
                            <td className="px-4 py-2.5 text-gray-500 font-medium text-xs">{spec.label}</td>
                            <td className="px-4 py-2.5 text-emerald-900 dark:text-emerald-100 text-xs">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <div className="space-y-3 pb-4">
                <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white gap-2 min-h-[48px]" onClick={() => scrollTo("permintaan-penawaran")}>
                  <Lightbulb className="w-4 h-4" />Ajukan Penawaran
                </Button>
                <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-2 min-h-[48px]" onClick={() => { onClose(); window.open(WA_URL, "_blank"); }}>
                  <MessageSquare className="w-4 h-4" />Hubungi via WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function ComparisonTable() {
  return (
    <div className="rounded-xl border border-emerald-200 dark:border-emerald-700/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-emerald-700 dark:bg-emerald-800">
              <th className="px-4 py-3 text-left text-white font-semibold text-xs uppercase tracking-wider">Spesifikasi</th>
              {products.map((p) => (
                <th key={p.id} className="px-4 py-3 text-center text-white font-semibold text-xs uppercase tracking-wider">
                  <div className="flex flex-col items-center gap-1"><p.icon className="w-4 h-4" /><span>{p.title}</span></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row, i) => (
              <tr key={row.spec} className={i % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-emerald-50/40 dark:bg-gray-800/50"}>
                <td className="px-4 py-3 text-emerald-900 dark:text-emerald-100 font-medium text-xs">{row.spec}</td>
                {products.map((p) => <td key={p.id} className="px-4 py-3 text-gray-700 dark:text-gray-300 text-xs text-center">{row[p.id as keyof typeof row] as string}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ProductsSection() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "comparison">("grid");
  const featured = products[0];

  return (
    <section id="produk" className="py-12 sm:py-16 lg:py-20 bg-gray-50/50 dark:bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, #047857 0.5px, transparent 0.5px)`, backgroundSize: "24px 24px", opacity: 0.03 }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal delay={0}>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 mb-4">
              <Lightbulb className="w-3.5 h-3.5 mr-1.5" />Produk Kami
            </Badge>
            <h2 className="section-heading">Solusi Produk Unggulan</h2>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
              Empat pilar produk kami untuk mendukung pembangunan energi dan infrastruktur Indonesia
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <div className="mb-12">
            <h3 className="text-center text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-8">Mengapa Memilih Kami?</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {whyChooseUs.map((item) => (
                <div key={item.title} className={`flex flex-col items-center text-center gap-3 p-5 sm:p-6 rounded-xl bg-white dark:bg-gray-800 border ${item.border} dark:border-gray-700/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group`}>
                  <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`w-7 h-7 ${item.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100"><WhyChooseCounter value={item.value} suffix={item.suffix} /></div>
                  <div>
                    <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="flex items-center justify-center gap-2 mb-8">
            <Button variant={viewMode === "grid" ? "default" : "outline"} onClick={() => setViewMode("grid")} className={viewMode === "grid" ? "bg-emerald-700 hover:bg-emerald-800 text-white gap-2 min-h-[44px]" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-2 min-h-[44px]"}>
              <LayoutGrid className="w-4 h-4" />Tampilan Grid
            </Button>
            <Button variant={viewMode === "comparison" ? "default" : "outline"} onClick={() => setViewMode("comparison")} className={viewMode === "comparison" ? "bg-emerald-700 hover:bg-emerald-800 text-white gap-2 min-h-[44px]" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-2 min-h-[44px]"}>
              <Table2 className="w-4 h-4" />Bandingkan Produk
            </Button>
          </div>
        </ScrollReveal>

        {viewMode === "comparison" ? (
          <ScrollReveal delay={0.15}><ComparisonTable /></ScrollReveal>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Featured product — PJU, spans full width, horizontal layout on md+ */}
            <ScrollReveal delay={0} className="sm:col-span-2 lg:col-span-3">
              <Card className="premium-card cursor-pointer h-full group hover:-translate-y-1 overflow-hidden" onClick={() => setSelectedProduct(featured)}>
                <div className={`h-2 bg-gradient-to-r ${featured.gradient}`} />
                <div className="grid md:grid-cols-2">
                  <div className="relative aspect-[16/9] md:aspect-square overflow-hidden">
                    <Image src={productImages[featured.id]} alt={featured.title || "Product item"} fill className="object-cover transition-transform duration-500 group-hover:scale-105" priority />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-emerald-600 text-white gap-1.5"><Lightbulb className="w-3 h-3" />Pilihan Utama</Badge>
                    </div>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                      <div className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/95 shadow-xl text-emerald-700 text-sm font-bold border border-emerald-200">
                        <MessageSquare className="w-4 h-4" />Minta Penawaran
                      </div>
                    </div>
                  </div>
                  <CardContent className="relative p-6 sm:p-8 flex flex-col justify-center gap-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-14 h-14 rounded-xl ${featured.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <featured.icon className={`w-7 h-7 ${featured.iconColor}`} />
                      </div>
                      <Badge variant="outline" className="border-emerald-200 text-emerald-700 text-xs bg-white/80">{featured.productCount} Varian Produk</Badge>
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-100 group-hover:text-emerald-700 transition-colors">{featured.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{featured.subtitle}</p>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">{featured.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {featured.features.map((feature) => (
                        <span key={feature} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 text-xs text-emerald-700 dark:text-emerald-300">
                          <span className="w-1 h-1 rounded-full bg-emerald-500" />{feature}
                        </span>
                      ))}
                    </div>
                    <Button variant="outline" className="self-start border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-2 min-h-[44px] text-sm">
                      Lihat Detail<ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </div>
              </Card>
            </ScrollReveal>

            {/* Standard product cards — remaining 3 in a row */}
            {products.slice(1).map((product, index) => (
              <ScrollReveal key={product.id} delay={(index + 1) * 0.1}>
                <Card className="premium-card cursor-pointer h-full group hover:-translate-y-1" onClick={() => setSelectedProduct(product)}>
                  <div className={`h-2 bg-gradient-to-r ${product.gradient}`} />
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image src={productImages[product.id]} alt={product.title || "Product item"} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                      <div className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/95 shadow-xl text-emerald-700 text-sm font-bold border border-emerald-200">
                        <MessageSquare className="w-4 h-4" />Minta Penawaran
                      </div>
                    </div>
                  </div>
                  <CardContent className="relative p-4 sm:p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl ${product.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <product.icon className={`w-6 h-6 ${product.iconColor}`} />
                      </div>
                      <Badge variant="outline" className="border-emerald-200 text-emerald-700 text-xs bg-white/80">{product.productCount} Produk</Badge>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-100 group-hover:text-emerald-700 transition-colors">{product.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{product.subtitle}</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">{product.description}</p>
                    <ul className="space-y-1.5">
                      {product.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />{feature}
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-2 min-h-[44px] text-sm mt-2">
                      Lihat Detail<ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>

      {selectedProduct && <ProductDetailPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </section>
  );
}
