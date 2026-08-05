"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import Script from "next/script";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { HelpCircle, Search } from "lucide-react";

interface FAQ { question: string; answer: string; }

const faqCategories: Record<string, FAQ[]> = {
  umum: [
    { question: "Apakah DBSN Dayaberkah.id melayani pengiriman ke seluruh Indonesia?", answer: "Ya, DBSN Dayaberkah.id melayani pengiriman produk ke seluruh wilayah Indonesia, mulai dari Sumatera hingga Papua. Kami bekerja sama dengan jasa logistik terpercaya untuk memastikan produk sampai dengan aman dan tepat waktu." },
    { question: "Berapa lama proses pengiriman produk?", answer: "Estimasi waktu pengiriman bervariasi tergantung lokasi tujuan. Untuk wilayah Jawa, pengiriman membutuhkan 3–5 hari kerja. Untuk luar Jawa 5–10 hari kerja. Untuk wilayah Indonesia Timur, estimasi 7–14 hari kerja." },
    { question: "Apakah tersedia layanan pemasangan/instalasi?", answer: "Ya, DBSN Dayaberkah.id menyediakan layanan pemasangan dan instalasi profesional untuk seluruh produk kami. Tim teknisi bersertifikasi kami siap membantu instalasi PJU, panel surya, penangkal petir, dan sistem baterai di lokasi proyek Anda." },
    { question: "Bagaimana cara mendapatkan katalog produk?", answer: "Anda dapat menghubungi tim sales kami melalui WhatsApp, mengirim email ke info@dayaberkah.id, atau mengisi formulir pada halaman Hubungi Kami. Tim kami akan segera mengirimkan katalog produk digital serta informasi harga terbaru." },
    { question: "Apakah DBSN Dayaberkah.id menyediakan garansi produk?", answer: "Tentu, seluruh produk DBSN Dayaberkah.id dilengkapi garansi resmi. Garansi bervariasi: PJU LED (2–3 tahun), Panel Surya (5–10 tahun), Penangkal Petir (3–5 tahun), dan Baterai LiFePO4 (5–10 tahun)." },
  ],
  produk: [
    { question: "Apa perbedaan PJU LED konvensional dan PJU Tenaga Surya?", answer: "PJU LED konvensional terhubung dengan jaringan listrik PLN. Sementara PJU Tenaga Surya beroperasi secara mandiri menggunakan energi matahari. Keunggulan PJU Tenaga Surya: hemat biaya operasional, cocok untuk area terpencil, ramah lingkungan, dan dapat dipasang di lokasi mana pun." },
    { question: "Berapa daya panel surya yang tersedia?", answer: "DBSN Dayaberkah.id menyediakan panel surya dengan berbagai kapasitas mulai dari 50Wp hingga 550Wp dengan efisiensi konversi hingga 21%. Seluruh panel surya kami bersertifikasi SNI dan IEC." },
    { question: "Apakah produk penangkal petir sudah tersertifikasi?", answer: "Ya, seluruh produk penangkal petir DBSN Dayaberkah.id telah memenuhi standar nasional (SNI) dan internasional (IEC 62305). Kami juga menyediakan sertifikat garansi dan dokumen teknis untuk setiap instalasi." },
    { question: "Berapa umur pakai baterai LiFePO4?", answer: "Baterai LiFePO4 dari DBSN Dayaberkah.id memiliki umur pakai 2.000–6.000 siklus pengisian dan dapat bertahan 5–10 tahun. Keunggulan: lebih aman, efisiensi pengisian 95%, bobot lebih ringan 40%, dan ramah lingkungan." },
    { question: "Apakah tersedia produk PJU Smart dengan IoT?", answer: "Ya, DBSN Dayaberkah.id menyediakan solusi PJU Smart City yang dilengkapi teknologi IoT. Fitur: monitoring dan kontrol jarak jauh, sensor cahaya otomatis, pengukuran konsumsi energi real-time, deteksi kerusakan otomatis, dan penjadwalan dimmer." },
  ],
  pengadaan: [
    { question: "Bagaimana proses pengadaan melalui e-Katalog LKPP?", answer: "Proses pengadaan sangat mudah: 1) Kunjungi portal e-Katalog LKPP, 2) Cari produk DBSN Dayaberkah.id, 3) Pilih produk sesuai kebutuhan, 4) Buat Surat Pesanan Elektronik (SPE), 5) Tim kami mengkonfirmasi dan memproses pengiriman." },
    { question: "Apakah DBSN Dayaberkah.id terdaftar sebagai vendor di LKPP?", answer: "Ya, DBSN Dayaberkah.id telah terdaftar resmi sebagai vendor penyedia di sistem LKPP. Kami terdaftar di beberapa kategori: PJU, Panel Surya, Penangkal Petir, dan Komponen Elektrikal." },
    { question: "Berapa nilai TKDN produk DBSN Dayaberkah.id?", answer: "Nilai TKDN produk DBSN Dayaberkah.id berkisar antara 40%–60%, telah memenuhi persyaratan minimum untuk pengadaan pemerintah. Sertifikat TKDN diterbitkan oleh lembaga surveyor resmi yang terakreditasi KAN." },
    { question: "Apakah tersedia dukungan dokumen tender/pengadaan?", answer: "Ya, DBSN Dayaberkah.id menyediakan dukungan penuh untuk kebutuhan dokumen tender: Company Profile, Sertifikat SNI/TKDN, Sertifikat ISO, Referensi proyek, Surat Jaminan, serta dokumen teknis dan brosur produk." },
    { question: "Bagaimana proses pengajuan penawaran untuk proyek pemerintah?", answer: "Proses: 1) Hubungi tim sales dengan membawa RKS/RAB, 2) Tim kami melakukan survey dan analisis, 3) Kami menyusun penawaran teknis dan komersial, 4) Penawaran dikirimkan sesuai jadwal tender, 5) Presentasi dan klarifikasi jika terpilih, 6) Penandatanganan kontrak." },
  ],
};

const categoryLabels: Record<string, string> = { umum: "Umum", produk: "Produk", pengadaan: "Pengadaan" };
const categoryIcons: Record<string, string> = { umum: "🏢", produk: "💡", pengadaan: "📋" };

function FAQJsonLd() {
  const allFaqs = Object.values(faqCategories).flat();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
  };
  return (
    <Script
      id="faq-json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      strategy="afterInteractive"
    />
  );
}

export default function FAQSection() {
  const [activeTab, setActiveTab] = useState("umum");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFAQs = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return faqCategories;
    const result: Record<string, FAQ[]> = {};
    for (const [category, faqs] of Object.entries(faqCategories)) {
      const filtered = faqs.filter((faq) => faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query));
      if (filtered.length > 0) result[category] = filtered;
    }
    return result;
  }, [searchQuery]);

  const totalResults = Object.values(filteredFAQs).reduce((acc, faqs) => acc + faqs.length, 0);

  return (
    <section id="faq" className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
      <FAQJsonLd />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal delay={0}>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 mb-4">
              <HelpCircle className="w-3.5 h-3.5 mr-1.5" />FAQ
            </Badge>
            <h2 className="section-heading">Pertanyaan yang Sering Diajukan</h2>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
              Temukan jawaban untuk pertanyaan umum tentang produk dan layanan DBSN Dayaberkah.id
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input type="text" placeholder="Cari pertanyaan..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 border-emerald-200 focus:border-emerald-500 text-base" aria-label="Search frequently asked questions" />
            {searchQuery && (
              <p className="text-sm text-gray-500 mt-2">
                Ditemukan <span className="font-semibold text-emerald-700">{totalResults}</span> hasil untuk &ldquo;<span className="font-medium">{searchQuery}</span>&rdquo;
              </p>
            )}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <Tabs value={Object.keys(filteredFAQs).includes(activeTab) ? activeTab : (Object.keys(filteredFAQs)[0] ?? "umum")} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-6 bg-transparent h-auto p-0 border-b border-gray-200 dark:border-gray-700">
              {Object.keys(faqCategories).map((key) => (
                <TabsTrigger key={key} value={key} disabled={!filteredFAQs[key]}
                  className="py-2.5 text-sm font-medium data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-700 data-[state=active]:font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:data-[state=active]:text-emerald-400 border-b-2 border-transparent rounded-none transition-all duration-200 min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed">
                  <span className="mr-1.5">{categoryIcons[key]}</span>{categoryLabels[key]}
                  <span className="ml-1.5 text-xs opacity-60">({faqCategories[key]?.length ?? 0})</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(faqCategories).map(([key]) => (
              <TabsContent key={key} value={key} className="mt-0">
                <Accordion type="single" collapsible className="space-y-3">
                  {(filteredFAQs[key] || []).map((faq, index) => (
                    <AccordionItem key={index} value={`${key}-${index}`}
                      className="border border-emerald-100 dark:border-emerald-800/50 rounded-xl px-5 data-[state=open]:bg-emerald-50/50 dark:data-[state=open]:bg-emerald-900/30 data-[state=open]:border-emerald-200 dark:data-[state=open]:border-emerald-700 transition-colors">
                      <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 hover:text-emerald-700 hover:no-underline py-4 min-h-[44px]">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pb-5">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                {(filteredFAQs[key] || []).length === 0 && searchQuery && (
                  <div className="text-center py-12">
                    <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Tidak ada pertanyaan yang cocok dengan pencarian Anda.</p>
                    <button onClick={() => setSearchQuery("")} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-2 underline underline-offset-2">Reset pencarian</button>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="mt-12 text-center p-6 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-1">Masih memiliki pertanyaan?</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Tim kami siap membantu Anda. Hubungi kami untuk konsultasi gratis.</p>
            <a href="#hubungi-kami" onClick={(e) => { e.preventDefault(); document.getElementById("hubungi-kami")?.scrollIntoView({ behavior: "smooth" }); }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded-lg transition-colors min-h-[44px]">
              Hubungi Kami
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
