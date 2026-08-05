"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/api/sanity/image";
import type { Certification } from "@/lib/api/sanity/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Award, FileText, Download, ExternalLink, Calendar, ShieldCheck, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CertificationsGridProps {
  certifications: Certification[];
}

export default function CertificationsGrid({ certifications }: CertificationsGridProps) {
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filterCategories = useMemo(() => {
    const types = new Set(certifications.map((c) => c.certType));
    return ["all", ...Array.from(types)];
  }, [certifications]);

  const filteredCerts = useMemo(() => {
    if (activeFilter === "all") return certifications;
    return certifications.filter((c) => c.certType === activeFilter);
  }, [certifications, activeFilter]);

  const isPdf = (url?: string) => {
    if (!url) return false;
    return url.toLowerCase().includes(".pdf");
  };

  return (
    <div className="space-y-8">
      {/* Category Filter Badges */}
      <div className="flex flex-wrap gap-2 justify-center">
        {filterCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl border transition-all duration-200 min-h-[40px] cursor-pointer ${
              activeFilter === cat
                ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                : "bg-white dark:bg-gray-900 border-slate-200/50 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-slate-50"
            }`}
          >
            {cat === "all" ? "Semua Sertifikasi" : cat}
          </button>
        ))}
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCerts.length > 0 ? (
          filteredCerts.map((cert) => (
            <div
              key={cert._id}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-gray-800/80 overflow-hidden hover:shadow-md transition duration-300 flex flex-col justify-between group"
            >
              <div className="p-6 space-y-4">
                {/* Certificate Cover */}
                <div className="aspect-[4/3] w-full bg-slate-50 dark:bg-gray-950 rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-100/60 dark:border-gray-800">
                  {cert.coverImage ? (
                    <Image
                      src={getOptimizedImageUrl(cert.coverImage, 400, 300) || ""}
                      alt={cert.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-6 text-center">
                      <Award className="w-12 h-12 text-emerald-600 dark:text-emerald-500/80" />
                      <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-200">{cert.certType}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900">
                      {cert.certType}
                    </Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{cert.certificationBody}</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-snug group-hover:text-emerald-700 transition-colors">
                    {cert.title}
                  </h2>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-6 pb-6 pt-3 border-t border-slate-50 dark:border-gray-850 flex justify-between items-center text-sm">
                <div className="text-slate-600 dark:text-gray-400">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Masa Berlaku</p>
                  <p className="font-semibold text-xs flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }) : "Seumur Hidup"}
                  </p>
                </div>
                {cert.documentUrl && (
                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 hover:text-emerald-900 text-xs font-bold transition cursor-pointer border border-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Lihat Dokumen
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white dark:bg-gray-900 rounded-3xl border border-slate-100/50">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-base font-semibold">Tidak ada sertifikasi dengan kategori ini.</p>
          </div>
        )}
      </div>

      {/* Document Dialog Modal */}
      <Dialog open={!!selectedCert} onOpenChange={(open) => !open && setSelectedCert(null)}>
        <DialogContent className="max-w-4xl w-[95vw] sm:rounded-2xl p-6 bg-white dark:bg-gray-900 gap-6">
          {selectedCert && (
            <>
              <DialogHeader className="border-b border-slate-100 dark:border-gray-800 pb-3 flex flex-row items-start justify-between">
                <div>
                  <DialogTitle className="text-lg sm:text-xl font-bold text-gray-950 dark:text-white flex items-center gap-2 pr-6">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    {selectedCert.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm text-gray-500 mt-1">
                    Diterbitkan oleh <span className="font-semibold">{selectedCert.certificationBody}</span> &bull; Tipe: <span className="font-semibold">{selectedCert.certType}</span>
                  </DialogDescription>
                </div>
              </DialogHeader>

              {/* Document Container */}
              <div className="w-full flex justify-center bg-slate-50 dark:bg-gray-950 rounded-xl overflow-hidden border border-slate-100/80 dark:border-gray-800">
                {selectedCert.documentUrl ? (
                  isPdf(selectedCert.documentUrl) ? (
                    <iframe
                      src={selectedCert.documentUrl}
                      className="w-full h-[65vh] rounded-xl"
                      title={selectedCert.title}
                    />
                  ) : (
                    <div className="relative w-full h-[65vh] p-2 flex items-center justify-center">
                      <Image
                        src={selectedCert.documentUrl}
                        alt={selectedCert.title}
                        fill
                        className="object-contain"
                        sizes="(max-width: 1024px) 95vw, 80vw"
                      />
                    </div>
                  )
                ) : (
                  <div className="py-24 text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Dokumen tidak dapat dimuat.</p>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-gray-800">
                <span className="text-xs text-gray-400 font-medium">
                  Status Berlaku: {selectedCert.expiryDate ? "Hingga " + new Date(selectedCert.expiryDate).toLocaleDateString("id-ID", { year: "numeric", month: "long" }) : "Seumur Hidup"}
                </span>
                <div className="flex gap-2">
                  {selectedCert.documentUrl && (
                    <>
                      <a
                        href={selectedCert.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs sm:text-sm font-bold text-slate-700 dark:border-gray-800 dark:text-slate-200 dark:hover:bg-gray-800 min-h-[44px]"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Tab Baru
                      </a>
                      <a
                        href={selectedCert.documentUrl}
                        download
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-xs sm:text-sm font-bold text-white shadow-sm min-h-[44px]"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
