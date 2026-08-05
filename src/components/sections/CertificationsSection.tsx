"use client";

import { Badge } from "@/components/ui/badge";
import { Shield, Award, CheckCircle, FileCheck, Layers } from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";

export interface CertificationItem {
  id: string;
  title: string;
  certType: string;
  certificationBody: string;
  issueDate: string;
  expiryDate: string;
  description: string | null;
}

interface CertificationsSectionProps {
  certifications?: CertificationItem[];
}

const certBodies = [
  { name: "Badan Standardisasi Nasional", short: "BSN", color: "bg-red-700" },
  { name: "TÜV Rheinland", short: "TÜV", color: "bg-blue-800" },
  { name: "Kementerian Perindustrian", short: "Kemenperin", color: "bg-emerald-800" },
  { name: "LKPP (E-Katalog)", short: "LKPP", color: "bg-amber-600" },
];

export default function CertificationsSection({ certifications = [] }: CertificationsSectionProps) {
  const activeCount = certifications.length > 0 ? certifications.length : 12;

  return (
    <section id="sertifikasi" className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left: Heading & Statement */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <ScrollReveal delay={0}>
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 mb-2">
                <Shield className="w-3.5 h-3.5 mr-1.5" />Standardisasi & Mutu
              </Badge>
              <h2 className="section-heading lg:text-left lg:after:mx-0">
                Standar Kelayakan & Legalitas Resmi
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.05}>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed font-medium">
                Sebagai komitmen menjaga integritas ketenagalistrikan dan keberlanjutan energi nasional, seluruh produk dan layanan kami sepenuhnya tersertifikasi oleh lembaga regulator terkait.
              </p>
              <div className="mt-4 flex flex-wrap justify-center lg:justify-start gap-3 text-sm font-semibold text-emerald-800 dark:text-emerald-400">
                <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-md border border-emerald-100 dark:border-emerald-900">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Sertifikasi SNI
                </span>
                <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-md border border-emerald-100 dark:border-emerald-900">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> ISO 9001:2015
                </span>
                <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-md border border-emerald-100 dark:border-emerald-900">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> TKDN Pemerintah
                </span>
                <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-md border border-emerald-100 dark:border-emerald-900">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> E-Katalog LKPP
                </span>
              </div>
            </ScrollReveal>
          </div>

          {/* Right: Shield Badge Trust Metric */}
          <div className="lg:col-span-5 flex justify-center">
            <ScrollReveal delay={0.1}>
              <div className="relative group p-8 sm:p-10 rounded-3xl border border-emerald-100 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50/50 to-amber-50/30 dark:from-emerald-950/20 dark:to-gray-900 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 w-full max-w-[340px] text-center">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-amber-400 rounded-t-3xl" />
                
                {/* Gold Shield Container */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-9 h-9 text-white" />
                </div>

                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-900 dark:text-emerald-100 leading-none">
                  {activeCount}
                </div>
                <div className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mt-2">
                  Sertifikasi Aktif
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal mt-3">
                  Terdaftar resmi di portal pengadaan e-Katalog LKPP dan teruji secara berkala oleh Balai Sertifikasi Nasional.
                </p>
              </div>
            </ScrollReveal>
          </div>

        </div>

        {/* Certification Body Logo Strip */}
        <ScrollReveal delay={0.15}>
          <div className="h-px bg-gray-200/60 dark:bg-gray-800/80 my-8 sm:my-10" />
          <div className="text-center">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-6">Lembaga Akreditasi & Standardisasi</p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              {certBodies.map((body) => (
                <div key={body.short} className="flex items-center gap-3 group">
                  <div className={`w-10 h-10 rounded-lg ${body.color} flex items-center justify-center text-white font-extrabold text-xs shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                    {body.short}
                  </div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {body.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
