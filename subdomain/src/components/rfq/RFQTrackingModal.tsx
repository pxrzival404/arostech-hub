"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle2,
  Clock,
  FileText,
  Send,
  XCircle,
  Mail,
  RefreshCw,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackingData {
  id: string;
  status: string;
  folderName: string;
  totalProducts: number;
  submittedAt: string | null;
  createdAt: string;
  companyName: string;
  client: { company: string };
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

interface RFQTrackingModalProps {
  rfqId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Timeline steps definition
const TIMELINE_STEPS = [
  {
    key: "SUBMITTED",
    label: "Pengajuan Terkirim",
    description: "RFQ Anda telah berhasil dikirim ke sistem",
    icon: Send,
  },
  {
    key: "RAW_SENT",
    label: "Konfirmasi Email Terkirim",
    description: "Email konfirmasi + Raw RFQ PDF dikirim ke email Anda",
    icon: Mail,
  },
  {
    key: "PROCESSING",
    label: "Sedang Diproses",
    description: "Tim sales sedang mereview dan menyiapkan penawaran",
    icon: RefreshCw,
  },
  {
    key: "QUOTED",
    label: "Penawaran Diberikan",
    description: "Penawaran resmi (Processed RFQ) telah dikirim ke email Anda",
    icon: FileText,
  },
  {
    key: "ACCEPTED",
    label: "Selesai",
    description: "Penawaran telah diterima, proses RFQ selesai",
    icon: CheckCircle2,
  },
];

function getStepIndex(status: string): number {
  switch (status) {
    case "SUBMITTED":
      return 0;
    case "PROCESSING":
      return 2;
    case "QUOTED":
      return 3;
    case "ACCEPTED":
      return 4;
    case "REJECTED":
      return -1;
    default:
      return 0;
  }
}

function hasRawReportSent(reports: Array<{ type: string; emailSentAt: string | null }>): boolean {
  return reports.some((r) => r.type === "ORIGINAL_REQUEST" && r.emailSentAt !== null);
}

function hasProcessedReportSent(reports: Array<{ type: string; emailSentAt: string | null }>): boolean {
  return reports.some((r) => r.type === "PROCESSED_RESULT" && r.emailSentAt !== null);
}

export function RFQTrackingModal({ rfqId, open, onOpenChange }: RFQTrackingModalProps) {
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && rfqId) {
      fetchTracking();
    }
    if (!open) {
      setTracking(null);
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, rfqId]);

  const fetchTracking = async () => {
    if (!rfqId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/rfq/track?id=${encodeURIComponent(rfqId)}`);
      const data = await res.json();
      if (res.ok) {
        setTracking(data.rfq);
      } else {
        setError(data.error || "RFQ tidak ditemukan");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const currentStep = tracking ? getStepIndex(tracking.status) : 0;
  const isRejected = tracking?.status === "REJECTED";
  const rawSent = tracking ? hasRawReportSent(tracking.reports) : false;
  const processedSent = tracking ? hasProcessedReportSent(tracking.reports) : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="size-5 text-emerald-600" />
            Lacak Status RFQ
          </DialogTitle>
          <DialogDescription>
            Pantau perkembangan pengajuan RFQ Anda secara real-time
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-emerald-600" />
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {tracking && !loading && (
          <div className="space-y-6">
            {/* RFQ Info Header */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">RFQ ID</span>
                <Badge
                  variant={isRejected ? "destructive" : "default"}
                  className={cn(
                    !isRejected && "bg-emerald-600 text-white"
                  )}
                >
                  {isRejected ? "Ditolak" : tracking.status === "ACCEPTED" ? "Selesai" : tracking.status === "QUOTED" ? "Penawaran Diberikan" : tracking.status === "PROCESSING" ? "Sedang Diproses" : "Terkirim"}
                </Badge>
              </div>
              <p className="font-mono text-xs break-all">{tracking.id}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                <span>{tracking.folderName}</span>
                <span>•</span>
                <span>{tracking.totalProducts} produk</span>
                {tracking.submittedAt && (
                  <>
                    <span>•</span>
                    <span>{new Date(tracking.submittedAt).toLocaleString("id-ID")}</span>
                  </>
                )}
              </div>
            </div>

            {/* Status Timeline */}
            <div className="space-y-0">
              {TIMELINE_STEPS.map((step, index) => {
                const isCompleted = !isRejected && (
                  // SUBMITTED step is completed if status >= SUBMITTED
                  (step.key === "SUBMITTED" && currentStep >= 0) ||
                  // RAW_SENT step is completed if raw report email was sent
                  (step.key === "RAW_SENT" && rawSent) ||
                  // PROCESSING step is completed if status >= PROCESSING
                  (step.key === "PROCESSING" && currentStep >= 2) ||
                  // QUOTED step is completed if status >= QUOTED (or processed report sent)
                  (step.key === "QUOTED" && (currentStep >= 3 || processedSent)) ||
                  // ACCEPTED step is completed if status === ACCEPTED
                  (step.key === "ACCEPTED" && currentStep >= 4)
                );

                const isCurrent = !isRejected && (
                  (step.key === "SUBMITTED" && currentStep === 0 && !rawSent) ||
                  (step.key === "RAW_SENT" && currentStep === 0 && rawSent) ||
                  (step.key === "RAW_SENT" && currentStep === 1) ||
                  (step.key === "PROCESSING" && currentStep === 2) ||
                  (step.key === "QUOTED" && currentStep === 3) ||
                  (step.key === "ACCEPTED" && currentStep === 4)
                );

                const isLast = index === TIMELINE_STEPS.length - 1;
                const Icon = step.icon;

                return (
                  <div key={step.key} className="flex gap-3">
                    {/* Timeline line + dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "size-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors",
                          isCompleted
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : isCurrent
                            ? "bg-emerald-50 dark:bg-emerald-900/50 border-emerald-600 text-emerald-600"
                            : "bg-muted border-muted-foreground/30 text-muted-foreground/50"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="size-4" />
                        ) : (
                          <Icon className="size-4" />
                        )}
                      </div>
                      {!isLast && (
                        <div
                          className={cn(
                            "w-0.5 h-8 transition-colors",
                            isCompleted ? "bg-emerald-600" : "bg-muted-foreground/20"
                          )}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className={cn("pb-6", isLast && "pb-0")}>
                      <p
                        className={cn(
                          "text-sm font-medium",
                          isCompleted || isCurrent
                            ? "text-foreground"
                            : "text-muted-foreground/60"
                        )}
                      >
                        {step.label}
                      </p>
                      <p
                        className={cn(
                          "text-xs mt-0.5",
                          isCompleted || isCurrent
                            ? "text-muted-foreground"
                            : "text-muted-foreground/40"
                        )}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Rejected state */}
              {isRejected && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="size-8 rounded-full flex items-center justify-center shrink-0 border-2 bg-destructive border-destructive text-white">
                      <XCircle className="size-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      Penawaran Ditolak
                    </p>
                    <p className="text-xs mt-0.5 text-muted-foreground">
                      RFQ ini ditolak. Anda dapat menghubungi tim sales untuk informasi lebih lanjut.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Product list summary */}
            {tracking.items.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Daftar Produk
                </p>
                <ul className="space-y-1">
                  {tracking.items.map((item, i) => (
                    <li
                      key={i}
                      className="text-xs flex justify-between text-muted-foreground"
                    >
                      <span className="truncate mr-2">{item.productName}</span>
                      <span className="shrink-0">{item.quantity} unit</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Refresh button */}
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTracking}
                disabled={loading}
                className="gap-1.5"
              >
                <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
                Refresh Status
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
