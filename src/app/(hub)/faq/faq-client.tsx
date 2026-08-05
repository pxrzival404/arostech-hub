"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { HelpCircle, Search, Mail, MessageSquare, BookOpen, Settings, ShieldAlert } from "lucide-react";
import Link from "next/link";

export interface FAQItem {
  question: string;
  answer: string;
}

export const faqData: Record<"umum" | "teknis" | "layanan", FAQItem[]> = {
  umum: [
    {
      question: "Apakah PT. Daya Berkah Sentosa Nusantara (DBSN) melayani pengiriman dan proyek ke seluruh Indonesia?",
      answer: "Ya, PT. Daya Berkah Sentosa Nusantara (DBSN) melayani pengiriman produk dan pengerjaan proyek ke seluruh wilayah Indonesia, mulai dari Sumatera hingga Papua. Kami bekerja sama dengan jasa logistik kargo terpercaya untuk menjamin pengiriman aman dan tepat waktu sampai ke lokasi site proyek Anda."
    },
    {
      question: "Apakah PT. Daya Berkah Sentosa Nusantara (DBSN) terdaftar resmi di portal e-Katalog LKPP?",
      answer: "Ya, kami terdaftar resmi sebagai vendor penyedia di e-Katalog LKPP untuk berbagai kategori produk energi terbarukan seperti Penerangan Jalan Umum Tenaga Surya (PJUTS), modul panel surya, sistem penangkal petir, serta komponen kelistrikan pendukung lainnya."
    },
    {
      question: "Berapa lama estimasi waktu pengiriman barang?",
      answer: "Estimasi waktu bervariasi: wilayah Jawa (3-5 hari kerja), wilayah luar Jawa (5-10 hari kerja), dan wilayah Indonesia Timur (7-14 hari kerja) tergantung pada rute logistik kargo dan moda transportasi darat atau laut yang dipilih."
    },
    {
      question: "Apakah seluruh produk yang disediakan memiliki garansi resmi?",
      answer: "Tentu, seluruh produk yang kami sediakan dilengkapi garansi resmi pabrikan. Masa garansi berkisar dari 2-3 tahun untuk lampu jalan LED, 5-10 tahun untuk modul panel surya, dan 3-5 tahun untuk baterai penyimpanan lithium."
    }
  ],
  teknis: [
    {
      question: "Apa perbedaan utama antara PJU Solar Cell All-in-One dan Two-in-One?",
      answer: "PJU All-in-One mengintegrasikan panel surya, lampu LED, baterai lithium, dan solar charge controller dalam satu modul lampu utuh yang sangat mudah dipasang. Sedangkan tipe Two-in-One memisahkan panel surya dari badan lampu utama untuk mempermudah pengaturan sudut kemiringan panel surya secara optimal ke arah sinar matahari tanpa mengorbankan arah sorot lampu LED."
    },
    {
      question: "Berapa kapasitas daya solar panel (panel surya) yang tersedia?",
      answer: "DBSN Dayaberkah.id menyediakan modul panel surya dengan kapasitas daya bervariasi mulai dari 50Wp hingga 550Wp berteknologi Monocrystalline dan Polycrystalline yang memiliki efisiensi konversi sel tinggi bahkan dalam kondisi cuaca berawan."
    },
    {
      question: "Bagaimana standar sertifikasi penangkal petir yang digunakan?",
      answer: "Produk proteksi penangkal petir kami sepenuhnya memenuhi standar nasional (SNI) dan standar internasional IEC 62305. Setiap unit penangkal petir elektrostatis dilengkapi dengan dokumen uji laboratorium radius proteksi resmi."
    },
    {
      question: "Berapa lama siklus hidup (life cycle) baterai lithium LiFePO4?",
      answer: "Baterai Lithium Iron Phosphate (LiFePO4) kami memiliki umur siklus pengisian (life cycle) antara 2.000 hingga 6.000 siklus (sekitar 5-10 tahun pemakaian harian) dengan retensi kapasitas penyimpanan di atas 80%."
    }
  ],
  layanan: [
    {
      question: "Apakah PT. Daya Berkah Sentosa Nusantara (DBSN) menyediakan jasa instalasi dan commissioning di lapangan?",
      answer: "Ya, kami menyediakan tim teknisi internal bersertifikasi untuk melakukan survei awal lokasi, perencanaan mekanikal-elektrikal, instalasi fisik tiang dan komponen, hingga pengujian fungsional akhir (commissioning) di lokasi proyek."
    },
    {
      question: "Bagaimana prosedur pengajuan klaim garansi jika terjadi kendala teknis?",
      answer: "Anda dapat mengajukan klaim garansi dengan menghubungi customer support kami melalui email atau WhatsApp resmi dengan melampirkan invoice pembelian serta foto/video kondisi kendala. Tim engineering kami akan melakukan analisis jarak jauh terlebih dahulu sebelum memutuskan pengiriman unit pengganti atau perbaikan di tempat."
    },
    {
      question: "Apakah tersedia layanan pemeliharaan (maintenance) berkala?",
      answer: "Ya, kami menyediakan paket kontrak layanan pemeliharaan berkala untuk proyek lampu jalan umum perkotaan dan sistem PLTS atap industri guna memastikan performa penyerapan energi matahari tetap berada di level optimal."
    },
    {
      question: "Bagaimana cara mendapatkan katalog produk dan konsultasi teknis gratis?",
      answer: "Anda dapat dengan mudah mengisi form RFQ di halaman Kontak, mengirimkan email ke info@dayaberkah.id, atau mengklik tombol WhatsApp untuk langsung berdiskusi dengan tim sales engineering kami yang siap membantu merekomendasikan produk terbaik."
    }
  ]
};

const categoryLabels = {
  umum: "Umum",
  teknis: "Teknis",
  layanan: "Layanan"
};

const categoryIcons = {
  umum: BookOpen,
  teknis: Settings,
  layanan: ShieldAlert
};

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<"umum" | "teknis" | "layanan">("umum");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFAQs = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return faqData;

    const result: Record<"umum" | "teknis" | "layanan", FAQItem[]> = {
      umum: [],
      teknis: [],
      layanan: []
    };

    for (const [category, items] of Object.entries(faqData)) {
      const filtered = items.filter(
        (item) =>
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query)
      );
      result[category as "umum" | "teknis" | "layanan"] = filtered;
    }
    return result;
  }, [searchQuery]);

  const totalResults = useMemo(() => {
    return Object.values(filteredFAQs).reduce((acc, items) => acc + items.length, 0);
  }, [filteredFAQs]);

  const hasResultsInActiveCategory = filteredFAQs[activeCategory].length > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 pb-20">
      {/* Banner */}
      <section className="relative pt-32 pb-16 bg-emerald-900 dark:bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_45%)]" />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.015) 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-50 dark:from-gray-950 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <ScrollReveal delay={0}>
            <Badge variant="outline" className="border-emerald-300 text-emerald-300 bg-emerald-950/50 mb-4 px-3 py-1">
              <HelpCircle className="w-3.5 h-3.5 mr-1.5" />Tanya Jawab
            </Badge>
            <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl leading-tight">
              Pertanyaan yang Sering Diajukan
            </h1>
            <p className="mt-4 text-lg text-emerald-100 max-w-2xl mx-auto font-medium">
              Temukan jawaban cepat atas pertanyaan seputar spesifikasi teknis, pemesanan, dan layanan kami.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Search Bar */}
        <ScrollReveal delay={0.05}>
          <div className="relative mb-8 shadow-sm rounded-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Ketik kata kunci pertanyaan atau jawaban (misal: garansi, PJU, LKPP)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-white dark:bg-gray-900 border-emerald-100 dark:border-gray-800 focus-visible:ring-emerald-500 text-base rounded-xl"
              aria-label="Search frequently asked questions"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 -mt-4 pl-1">
              Ditemukan <span className="font-bold text-emerald-700 dark:text-emerald-400">{totalResults}</span> hasil untuk &ldquo;<span className="font-semibold">{searchQuery}</span>&rdquo;
            </p>
          )}
        </ScrollReveal>

        {/* Category Switches */}
        <ScrollReveal delay={0.1}>
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
            {(["umum", "teknis", "layanan"] as const).map((cat) => {
              const Icon = categoryIcons[cat];
              const isActive = activeCategory === cat;
              const count = filteredFAQs[cat].length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all shrink-0 min-h-[44px] border cursor-pointer ${
                    isActive
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                      : "bg-white dark:bg-gray-900 border-slate-200/50 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{categoryLabels[cat]}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-emerald-800 text-emerald-100" : "bg-slate-100 dark:bg-gray-800 text-gray-500"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Expandable Accordions */}
        <ScrollReveal delay={0.15}>
          {hasResultsInActiveCategory ? (
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFAQs[activeCategory].map((faq, index) => (
                <AccordionItem
                  key={`${activeCategory}-${index}`}
                  value={`${activeCategory}-${index}`}
                  className="bg-white dark:bg-gray-900 border border-emerald-100/50 dark:border-gray-800 rounded-2xl px-6 transition-all hover:shadow-sm data-[state=open]:shadow-md data-[state=open]:border-emerald-200"
                >
                  <AccordionTrigger className="text-left font-bold text-slate-800 dark:text-slate-100 hover:text-emerald-700 dark:hover:text-emerald-400 hover:no-underline py-5 text-sm sm:text-base leading-snug min-h-[44px]">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed pb-6 pt-1 border-t border-slate-50 dark:border-gray-850 mt-1">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-emerald-100/30">
              <HelpCircle className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tidak ada hasil ditemukan</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto px-4">
                Tidak ada pertanyaan atau jawaban di kategori &ldquo;{categoryLabels[activeCategory]}&rdquo; yang cocok dengan pencarian &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold text-sm mt-4 inline-flex items-center"
              >
                Reset Pencarian
              </button>
            </div>
          )}
        </ScrollReveal>

        {/* Footer Help Notice */}
        <ScrollReveal delay={0.2}>
          <div className="mt-16 text-center bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-gray-900 border border-emerald-100/80 dark:border-emerald-900/40 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-extrabold text-emerald-950 dark:text-emerald-200">Masih belum menemukan jawaban Anda?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-lg mx-auto">
              Tim sales engineering kami selalu siap membantu memberikan rekomendasi teknis dan penawaran terbaik.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl transition-all shadow-sm min-h-[44px]"
              >
                <Mail className="w-4 h-4" />
                <span>Kirim Pertanyaan</span>
              </Link>
              <a
                href="https://wa.me/6283112345678"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-slate-50 border border-slate-200 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl transition-all shadow-sm min-h-[44px]"
              >
                <MessageSquare className="w-4 h-4 text-green-600" />
                <span>Diskusi via WhatsApp</span>
              </a>
            </div>
          </div>
        </ScrollReveal>

      </main>
    </div>
  );
}
