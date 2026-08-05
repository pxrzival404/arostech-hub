"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SpokeLink as Link } from "@/components/SpokeLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RFQTrackingModal } from "@/components/rfq/RFQTrackingModal";
import {
  Search,
  Loader2,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  FileText,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    DRAFT: "Draft",
    SUBMITTED: "Terkirim",
    PROCESSING: "Diproses",
    QUOTED: "Diquote",
    ACCEPTED: "Diterima",
    REJECTED: "Ditolak",
  };
  return map[status] || status;
}

// M7: My RFQ item type
interface MyRFQ {
  id: string;
  folderName: string;
  status: string;
  totalProducts: number;
  submittedAt: string | null;
  createdAt: string;
  companyName: string;
  items: Array<{ productName: string; quantity: number }>;
}

interface RFQStatus {
  id: string;
  status: string;
  statusFormatted: string;
  statusColor: string;
  folderName: string;
  totalProducts: number;
  submittedAt: string | null;
  createdAt: string;
  companyName: string;
  client: {
    company: string;
  };
  items: Array<{
    productName: string;
    subcategory: string;
    quantity: number;
  }>;
  reports: Array<{
    type: string;
    createdAt: string;
    emailSentAt: string | null;
  }>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [trackingId, setTrackingId] = useState("");
  const [trackingResult, setTrackingResult] = useState<RFQStatus | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");

  // M7: My RFQs state
  const [myRFQs, setMyRFQs] = useState<MyRFQ[]>([]);
  const [myRFQsLoading, setMyRFQsLoading] = useState(true);

  // Tracking modal state
  const [modalRfqId, setModalRfqId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Redirect ke login jika belum login
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/login?callbackUrl=/dashboard");
    }
  }, [session, status, router]);

  // M7: Fetch my RFQs
  const fetchMyRFQs = useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      const res = await fetch("/api/rfq/mine");
      if (res.ok) {
        const data = await res.json();
        setMyRFQs(data.rfqs || []);
      }
    } catch (e) {
      console.error("Failed to fetch my RFQs:", e);
    } finally {
      setMyRFQsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchMyRFQs();
  }, [fetchMyRFQs]);

  const handleOpenTracking = (rfqId: string) => {
    setModalRfqId(rfqId);
    setModalOpen(true);
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setTrackingLoading(true);
    setTrackingError("");
    setTrackingResult(null);

    try {
      const res = await fetch(`/api/rfq/track?id=${encodeURIComponent(trackingId.trim())}`);
      const data = await res.json();

      if (res.ok) {
        setTrackingResult(data.rfq);
      } else {
        setTrackingError(data.error || "RFQ tidak ditemukan");
      }
    } catch (error) {
      console.error("Track error:", error);
      setTrackingError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setTrackingLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="pt-20 flex items-center justify-center min-h-screen">
        <Loader2 className="size-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!session) {
    return null; // Akan di-redirect
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return <Clock className="size-4" />;
      case "PROCESSING":
        return <Loader2 className="size-4" />;
      case "QUOTED":
        return <FileText className="size-4" />;
      case "ACCEPTED":
        return <CheckCircle2 className="size-4" />;
      case "REJECTED":
        return <XCircle className="size-4" />;
      default:
        return <AlertCircle className="size-4" />;
    }
  };

  return (
    <div className="pt-20 min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-b from-emerald-50 to-background dark:from-emerald-950/30 dark:to-background py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Selamat datang, {session.user?.name}! Lacak status RFQ Anda di sini.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                    <Package className="size-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Lihat Produk</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Jelajahi katalog produk PJU kami
                    </p>
                    <Button variant="link" asChild className="p-0 h-auto mt-2">
                      <Link href="/products">Buka →</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                    <FileText className="size-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Ajukan RFQ Baru</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Buat pengajuan penawaran baru
                    </p>
                    <Button variant="link" asChild className="p-0 h-auto mt-2">
                      <Link href="/rfq">Ajukan →</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                    <Package className="size-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Draft RFQ</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Lanjutkan draft yang belum selesai
                    </p>
                    <Button variant="link" asChild className="p-0 h-auto mt-2">
                      <Link href="/draft-rfq">Lihat Draft →</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* M7: My RFQs List */}
          <Card className="mb-10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5 text-emerald-600" />
                RFQ Saya
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myRFQsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-emerald-600" />
                </div>
              ) : myRFQs.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="size-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Anda belum memiliki pengajuan RFQ
                  </p>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    asChild
                  >
                    <Link href="/rfq">Ajukan RFQ Pertama</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myRFQs.map((rfq, index) => (
                    <motion.div
                      key={rfq.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="shrink-0 size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                        {getStatusIcon(rfq.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">
                          {rfq.folderName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{rfq.totalProducts} produk</span>
                          <span>•</span>
                          <span>
                            {rfq.submittedAt
                              ? new Date(rfq.submittedAt).toLocaleDateString("id-ID")
                              : new Date(rfq.createdAt).toLocaleDateString("id-ID")}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          rfq.status === "REJECTED"
                            ? "destructive"
                            : rfq.status === "ACCEPTED"
                            ? "default"
                            : "secondary"
                        }
                        className={cn(
                          "shrink-0 gap-1",
                          rfq.status === "QUOTED" && "bg-emerald-600 text-white",
                          rfq.status === "ACCEPTED" && "bg-emerald-600 text-white"
                        )}
                      >
                        {formatStatus(rfq.status)}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={() => handleOpenTracking(rfq.id)}
                      >
                        Lacak
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* RFQ Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="size-5 text-emerald-600" />
                Lacak RFQ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Masukkan ID RFQ yang Anda terima setelah submit untuk melihat status terkini.
              </p>

              <form onSubmit={handleTrack} className="flex gap-3 mb-6">
                <Input
                  type="text"
                  placeholder="Contoh: cm5abc123def..."
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={trackingLoading || !trackingId.trim()}
                >
                  {trackingLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Search className="size-4" />
                  )}
                  Lacak
                </Button>
              </form>

              {trackingError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4 flex items-start gap-2 text-sm text-destructive">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  {trackingError}
                </div>
              )}

              {trackingResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 border rounded-lg p-5"
                >
                  {/* Status header */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">RFQ ID</p>
                      <p className="font-mono text-sm font-medium">{trackingResult.id}</p>
                    </div>
                    <Badge
                      variant={trackingResult.statusColor as "default" | "secondary" | "destructive" | "outline"}
                      className="gap-1.5"
                    >
                      {getStatusIcon(trackingResult.status)}
                      {trackingResult.statusFormatted}
                    </Badge>
                  </div>

                  {/* Folder info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Nama Folder</p>
                      <p className="text-sm font-medium">{trackingResult.folderName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Produk</p>
                      <p className="text-sm font-medium">{trackingResult.totalProducts} jenis</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tanggal Submit</p>
                      <p className="text-sm font-medium">
                        {trackingResult.submittedAt
                          ? new Date(trackingResult.submittedAt).toLocaleString("id-ID")
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Perusahaan</p>
                      <p className="text-sm font-medium">
                        {trackingResult.companyName || trackingResult.client.company || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Daftar Produk</p>
                    <ul className="space-y-1">
                      {trackingResult.items.map((item, i) => (
                        <li
                          key={i}
                          className="text-sm flex justify-between border-b last:border-0 pb-1 last:pb-0"
                        >
                          <span className="text-foreground">{item.productName}</span>
                          <span className="text-muted-foreground">
                            {item.subcategory} • {item.quantity} unit
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Reports */}
                  {trackingResult.reports.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Riwayat Laporan</p>
                      <ul className="space-y-1">
                        {trackingResult.reports.map((report, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                            <FileText className="size-3" />
                            <span className="font-medium">
                              {report.type === "ORIGINAL_REQUEST"
                                ? "Permintaan Awal"
                                : "Hasil Proses"}
                            </span>
                            <span>•</span>
                            <span>{new Date(report.createdAt).toLocaleString("id-ID")}</span>
                            {report.emailSentAt && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-600">Email terkirim</span>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Back to dashboard */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTrackingResult(null);
                      setTrackingId("");
                    }}
                  >
                    <ArrowLeft className="size-4" />
                    Lacak RFQ Lain
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* RFQ Tracking Modal */}
      <RFQTrackingModal
        rfqId={modalRfqId}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
