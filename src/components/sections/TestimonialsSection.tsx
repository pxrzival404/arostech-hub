"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote, Star } from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";

interface Testimonial {
  id: number;
  quote: string;
  name: string;
  position: string;
  organization: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "DBSN menyelesaikan proyek PJU LED Kota Surabaya tepat waktu dengan kualitas produk dan layanan yang sangat memuaskan.",
    name: "Ir. Bambang Susanto, M.T.",
    position: "Kepala Dinas PU",
    organization: "Pemerintah Kota Surabaya",
    rating: 5,
  },
  {
    id: 2,
    quote: "Instalasi PLTS atap berjalan profesional. Tim menunjukkan keahlian tinggi dalam perencanaan dan eksekusi.",
    name: "Dewi Pratiwi, S.T., MBA",
    position: "Direktur Operasional",
    organization: "PT PLN (Persero)",
    rating: 5,
  },
  {
    id: 3,
    quote: "Sistem penangkal petir gedung kami memenuhi standar SNI & IEC sepenuhnya. Tim sangat kompeten dan responsif.",
    name: "Hendro Wibowo, S.E.",
    position: "Manager EPC",
    organization: "PT Wijaya Karya (Persero) Tbk",
    rating: 5,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rating ${rating} dari 5 bintang`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="testimonial" className="py-12 sm:py-16 lg:py-20 bg-emerald-50/50 dark:bg-emerald-950/20 border-y border-emerald-100/50 dark:border-emerald-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal delay={0}>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 mb-4">
              <Quote className="w-3.5 h-3.5 mr-1.5" />Testimoni
            </Badge>
            <h2 className="section-heading">Dipercaya oleh Berbagai Instansi</h2>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
              Ulasan dari mitra dan klien kami tentang layanan instalasi energi dan kelistrikan DBSN Dayaberkah.id
            </p>
          </div>
        </ScrollReveal>

        {/* Aggregate Trust Badge */}
        <ScrollReveal delay={0.05}>
          <div className="bg-white dark:bg-gray-800 border border-emerald-100/80 dark:border-gray-700/80 rounded-2xl p-4 shadow-sm max-w-md mx-auto mb-10">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-emerald-900 dark:text-emerald-50">4.9</span>
                <span className="text-sm text-gray-400">/5</span>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Dari 50+ Klien Terpercaya</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Equal-sized Testimonials Grid (1 row) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <ScrollReveal
              key={t.id}
              delay={0.1 + idx * 0.05}
              className={`${
                idx === 1 ? "hidden md:block" : idx === 2 ? "hidden lg:block" : "block"
              }`}
            >
              <Card className="border-emerald-100 dark:border-emerald-800/50 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col justify-between">
                <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                  
                  {/* Quote Icon */}
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                    <Quote className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  </div>

                  {/* Quote Text */}
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* Divider */}
                  <div className="h-px bg-emerald-100/50 dark:bg-emerald-900/50 w-full" />

                  {/* Profile info */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm text-emerald-950 dark:text-white truncate">
                        {t.name}
                      </h4>
                      <StarRating rating={t.rating} />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {t.position}
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold truncate">
                      {t.organization}
                    </p>
                  </div>

                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
