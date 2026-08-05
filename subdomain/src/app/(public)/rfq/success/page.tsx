"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SpokeLink as Link } from "@/components/SpokeLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  MessageCircle,
  Home,
  FolderOpen,
  FileText,
  Clock,
  Mail,
} from "lucide-react";
import { motion } from "framer-motion";

const methodInfo = {
  submit: {
    icon: CheckCircle2,
    title: "Pengajuan RFQ Berhasil Dilakukan!",
    description:
      "Penawaran Anda telah kami terima. Detail pengajuan dan penawaran resmi akan dikirimkan melalui email.",
  },
  whatsapp: {
    icon: MessageCircle,
    title: "Dikirim via WhatsApp",
    description:
      "Penawaran Anda telah dikirim melalui WhatsApp. Tim kami akan segera merespons dan menghubungi Anda kembali.",
  },
};

function RFQSuccessContent() {
  const searchParams = useSearchParams();
  const method = (searchParams.get("method") || "submit") as keyof typeof methodInfo;
  const rfqId = searchParams.get("id");
  const info = methodInfo[method] || methodInfo.submit;
  const Icon = info.icon;

  return (
    <div className="pt-20">
      <section className="py-16 lg:py-24 bg-background">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex size-24 rounded-full bg-emerald-100 dark:bg-emerald-900/50 items-center justify-center mb-6">
              <CheckCircle2 className="size-12 text-emerald-600" />
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-2">
              {info.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {info.description}
            </p>

            {/* RFQ ID Tracking */}
            {rfqId && method === "submit" && (
              <Card className="mb-6 text-left">
                <CardContent className="pt-6">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      ID Tracking RFQ Anda:
                    </p>
                    <p className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400 break-all">
                      {rfqId}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Simpan ID ini untuk melacak status RFQ Anda di Dashboard
                      kelak.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 2-PDF System Info Card */}
            {method === "submit" && (
              <Card className="mb-8 text-left border-emerald-200 dark:border-emerald-800">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                      <Mail className="size-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Anda akan menerima 2 dokumen PDF via email
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Pastikan untuk mengecek folder inbox Anda (juga folder
                        spam/junk jika tidak menemukannya).
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* PDF 1: Raw RFQ */}
                    <div className="flex gap-3 p-4 rounded-lg border border-emerald-100 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20">
                      <div className="shrink-0 size-9 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-300">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground flex items-center gap-1.5">
                          <FileText className="size-4 text-emerald-600" />
                          Konfirmasi Pengajuan (Raw RFQ)
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Dikirim <strong>segera</strong> setelah submit. Berisi
                          daftar produk yang Anda ajukan, sebagai bukti resmi
                          permintaan Anda telah diterima oleh sistem kami.
                        </p>
                      </div>
                    </div>

                    {/* PDF 2: Processed RFQ */}
                    <div className="flex gap-3 p-4 rounded-lg border border-amber-100 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20">
                      <div className="shrink-0 size-9 rounded-full bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center font-bold text-amber-700 dark:text-amber-300">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground flex items-center gap-1.5">
                          <Clock className="size-4 text-amber-600" />
                          Penawaran Resmi (Processed RFQ)
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Dikirim dalam <strong>1x24 jam kerja</strong> setelah
                          review tim sales. Berisi harga resmi yang dihitung
                          menggunakan formula di sistem kami, beserta estimasi
                          waktu pengiriman dan detail penawaran lainnya.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 mt-4">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      <strong>Penting:</strong> Harga resmi hanya tersedia di
                      PDF Processed RFQ (PDF ke-2). Estimasi harga tidak
                      ditampilkan di website agar sesuai dengan kebijakan
                      penawaran kami.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Langkah Selanjutnya */}
            {method === "submit" && (
              <div className="bg-muted/30 rounded-xl p-6 mb-8 text-left">
                <h3 className="font-semibold text-foreground mb-3">
                  Langkah Selanjutnya
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">1.</span>
                    Cek email Anda — PDF <strong>Raw RFQ</strong> akan dikirim
                    segera sebagai konfirmasi pengajuan
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">2.</span>
                    Tim sales kami akan mereview daftar produk yang Anda ajukan
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">3.</span>
                    Dalam <strong>1x24 jam kerja</strong>, Anda akan menerima
                    PDF <strong>Processed RFQ</strong> berisi penawaran harga
                    resmi
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">4.</span>
                    Jika ada pertanyaan, hubungi kami langsung via WhatsApp
                  </li>
                </ul>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                asChild
              >
                <Link href="/">
                  <Home className="size-4" />
                  Kembali ke Beranda
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/products">
                  <FolderOpen className="size-4" />
                  Lihat Produk Lain
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default function RFQSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="animate-spin size-8 border-2 border-emerald-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <RFQSuccessContent />
    </Suspense>
  );
}
