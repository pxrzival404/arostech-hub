"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
  Send,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck,
  Pencil,
  Save,
  X,
  Calculator,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useSpoke } from "@/components/SpokeProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SubdomainFilter } from "@/components/admin/SubdomainFilter";
import { DropzoneInput } from "@/components/ui/dropzone-input";

// === Types ===

interface RFQItem {
  id: string;
  productName: string;
  productSlug: string;
  productSerial: string | null;
  subcategory: string | null;
  quantity: number;
  baseUnitPrice: number | null;
  unitPrice: number | null;
  discountPercent: number;
  customNote: string | null;
  // Tier-resolved pricing from admin API (populated by resolveItemTierPricing)
  resolvedUnitPrice?: number;
  resolvedDiscountPercent?: number;
}

interface RFQReport {
  id: string;
  reportType: "ORIGINAL_REQUEST" | "PROCESSED_RESULT";
  fileUrl: string | null;
  emailSentAt: string | null;
  createdAt: string;
}

interface ClientInfo {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  companyAddress: string | null;
}

interface RFQ {
  id: string;
  folderName: string;
  folderDesc: string | null;
  status: string;
  totalProducts: number;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  overallDiscount: number;
  adminNotes: string | null;
  shippingCost: number | null;
  shippingCity: string | null;
  shippingAddress: string | null;
  companyName: string | null;
  companyContactPerson: string | null;
  companyEmail: string | null;
  companyAddress: string | null;
  client: ClientInfo;
  items: RFQItem[];
  reports: RFQReport[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Editable item state for admin editing
interface EditableItem {
  id: string;
  unitPrice: number;
  discountPercent: number;
  customNote: string;
}

// === Status Helpers ===

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ComponentType<{ className?: string }> }
> = {
  DRAFT: { label: "Draft", variant: "outline", icon: FileText },
  SUBMITTED: { label: "Submitted", variant: "secondary", icon: Send },
  PROCESSING: { label: "Processing", variant: "default", icon: Clock },
  QUOTED: { label: "Quoted", variant: "default", icon: CheckCircle2 },
  ACCEPTED: { label: "Accepted", variant: "default", icon: FileCheck },
  REJECTED: { label: "Rejected", variant: "destructive", icon: XCircle },
};

const nextStatusMap: Record<string, { status: string; label: string }[]> = {
  DRAFT: [{ status: "SUBMITTED", label: "Tandai Submitted" }],
  SUBMITTED: [{ status: "PROCESSING", label: "Mulai Proses" }],
  PROCESSING: [{ status: "QUOTED", label: "Kirim Penawaran" }],
  QUOTED: [
    { status: "ACCEPTED", label: "Diterima Klien" },
    { status: "REJECTED", label: "Ditolak Klien" },
  ],
  ACCEPTED: [],
  REJECTED: [],
};

// === Formatting ===

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// === Main Component ===

export function AdminRfqListClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const highlightId = searchParams.get("id");
  const urlStatus = searchParams.get("status");
  const { subdomain, isPreviewDomain } = useSpoke();

  const buildApiUrl = (path: string) => {
    if (!isPreviewDomain) return path;
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}subdomain=${subdomain}`;
  };

  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [urlStatusApplied, setUrlStatusApplied] = useState(false);

  // Detail dialog
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editItems, setEditItems] = useState<EditableItem[]>([]);
  const [editOverallDiscount, setEditOverallDiscount] = useState(0);
  const [editAdminNotes, setEditAdminNotes] = useState("");
  const [editShippingCost, setEditShippingCost] = useState(0);
  const [saving, setSaving] = useState(false);

  // Quote dialog
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);

  // M16: Status change confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    rfqId: string;
    newStatus: string;
    label: string;
  }>({ open: false, rfqId: "", newStatus: "", label: "" });
  const [quoteRfq, setQuoteRfq] = useState<RFQ | null>(null);
  const [quoteSalesName, setQuoteSalesName] = useState("");
  const [quoteSalesNotes, setQuoteSalesNotes] = useState("");
  const [quoteValidUntil, setQuoteValidUntil] = useState("");
  const [quoteSignatureUrl, setQuoteSignatureUrl] = useState("");
  const [quoteSignatureFile, setQuoteSignatureFile] = useState<File | null>(null);
  const [quoteSignaturePreview, setQuoteSignaturePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Apply URL status filter on initial load
  useEffect(() => {
    if (urlStatus && !urlStatusApplied) {
      // Map SUBMITTED from URL to show both SUBMITTED and PROCESSING
      if (urlStatus === "SUBMITTED") {
        setStatusFilter("SUBMITTED");
      } else if (["DRAFT", "PROCESSING", "QUOTED", "ACCEPTED", "REJECTED"].includes(urlStatus)) {
        setStatusFilter(urlStatus);
      }
      setUrlStatusApplied(true);
    }
  }, [urlStatus, urlStatusApplied]);

  const fetchRfqs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (searchDebounced) params.set("search", searchDebounced);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(buildApiUrl(`/api/admin/rfqs?${params}`));
      if (!res.ok) throw new Error("Gagal memuat data");
      const data = await res.json();
      setRfqs(data.rfqs);
      setPagination(data.pagination);
    } catch {
      toast.error("Gagal memuat data RFQ");
    } finally {
      setLoading(false);
    }
  }, [page, searchDebounced, statusFilter, subdomain, isPreviewDomain]);

  useEffect(() => {
    fetchRfqs();
  }, [fetchRfqs]);

  // Auto-open detail if highlightId in URL
  useEffect(() => {
    if (highlightId && rfqs.length > 0) {
      const found = rfqs.find((r) => r.id === highlightId);
      if (found) {
        fetchRfqDetail(found.id);
      }
    }
  }, [highlightId, rfqs.length]);

  const handleDownloadPdf = async (rfq: RFQ) => {
    // Find the first raw report, or fallback to processed
    const rawReport = rfq.reports.find(r => r.reportType === "ORIGINAL_REQUEST");
    const processedReport = rfq.reports.find(r => r.reportType === "PROCESSED_RESULT");
    const report = rawReport || processedReport;
    if (!report) {
      toast.error("Tidak ada dokumen PDF tersedia");
      return;
    }
    const type = report.reportType === "ORIGINAL_REQUEST" ? "raw" : "processed";
    try {
      const res = await fetch(buildApiUrl(`/api/admin/rfqs/${rfq.id}/pdf?type=${type}`));
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error((errData as { error?: string }).error || "Gagal mengunduh PDF");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rfq-${rfq.id.slice(0,8)}-${type}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Gagal mengunduh PDF");
    }
  };

  const fetchRfqDetail = async (id: string) => {
    setDetailLoading(true);
    setEditMode(false);
    try {
      const res = await fetch(buildApiUrl(`/api/admin/rfqs/${id}`));
      if (!res.ok) throw new Error("Gagal memuat detail");
      const data = await res.json();
      setSelectedRfq(data.rfq);
      // Initialize edit state from loaded data
      initEditState(data.rfq);
    } catch {
      toast.error("Gagal memuat detail RFQ");
    } finally {
      setDetailLoading(false);
    }
  };

  const initEditState = (rfq: RFQ) => {
    setEditItems(
      rfq.items.map((item) => ({
        id: item.id,
        // Use resolvedUnitPrice (tier-resolved) when no admin override
        unitPrice: item.unitPrice ?? item.resolvedUnitPrice ?? item.baseUnitPrice ?? 0,
        discountPercent: item.discountPercent ?? item.resolvedDiscountPercent ?? 0,
        customNote: item.customNote ?? "",
      }))
    );
    setEditOverallDiscount(rfq.overallDiscount ?? 0);
    setEditAdminNotes(rfq.adminNotes ?? "");
    setEditShippingCost(rfq.shippingCost ?? 0);
  };

  // Real-time calculated totals
  const calculatedTotals = useMemo(() => {
    if (!selectedRfq) return { subtotal: 0, overallDiscountAmount: 0, shipping: 0, grandTotal: 0 };

    const subtotal = editItems.reduce((sum, editItem) => {
      const rfqItem = selectedRfq.items.find((i) => i.id === editItem.id);
      if (!rfqItem) return sum;
      const resolvedUnitPrice = rfqItem.resolvedUnitPrice;
      const price = editItem.unitPrice || resolvedUnitPrice || rfqItem.baseUnitPrice || 0;
      const lineTotal = price * rfqItem.quantity * (1 - editItem.discountPercent / 100);
      return sum + lineTotal;
    }, 0);

    const overallDiscountAmount = subtotal * editOverallDiscount / 100;
    const shipping = editMode ? editShippingCost : (selectedRfq.shippingCost ?? 0);
    const grandTotal = subtotal - overallDiscountAmount + shipping;

    return { subtotal, overallDiscountAmount, shipping, grandTotal };
  }, [editItems, editOverallDiscount, editShippingCost, editMode, selectedRfq]);

  const handleStatusUpdate = async (
    rfqId: string,
    newStatus: string,
    options?: { salesName?: string; salesNotes?: string; validUntil?: string; signatureUrl?: string }
  ) => {
    setSubmitting(true);
    try {
      // If a signature file was selected, upload it first
      let finalSignatureUrl = options?.signatureUrl;
      if (quoteSignatureFile) {
        const formData = new FormData();
        formData.append("signature", quoteSignatureFile);
        const uploadRes = await fetch(buildApiUrl("/api/admin/signature-upload"), {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalSignatureUrl = uploadData.localPath; // e.g. "/signatures/sig-1234567890.png"
        } else {
          console.warn("[Signature Upload] Failed, proceeding without signature");
        }
      }

      const res = await fetch(buildApiUrl(`/api/admin/rfqs/${rfqId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, ...options, signatureUrl: finalSignatureUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengupdate status");
      }

      toast.success(data.message || "Status berhasil diupdate");

      // Close dialogs
      setQuoteDialogOpen(false);
      setQuoteRfq(null);

      // Refresh list & detail
      await fetchRfqs();
      if (selectedRfq?.id === rfqId) {
        await fetchRfqDetail(rfqId);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengupdate status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdits = async () => {
    if (!selectedRfq) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        // Send current status so the API doesn't require a change
        status: selectedRfq.status,
        overallDiscount: editOverallDiscount,
        adminNotes: editAdminNotes,
        shippingCost: editShippingCost,
        items: editItems.map((item) => ({
          id: item.id,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
          customNote: item.customNote,
        })),
      };

      const res = await fetch(buildApiUrl(`/api/admin/rfqs/${selectedRfq.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan perubahan");
      }

      toast.success("Perubahan penawaran berhasil disimpan");
      setEditMode(false);

      // Refresh detail
      await fetchRfqDetail(selectedRfq.id);
      await fetchRfqs();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  const openQuoteDialog = (rfq: RFQ) => {
    setQuoteRfq(rfq);
    setQuoteSalesName("");
    setQuoteSalesNotes("");
    // Default valid until: 30 days from now
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setQuoteValidUntil(d.toISOString().split("T")[0]);
    setQuoteDialogOpen(true);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const closeDetailDialog = () => {
    setSelectedRfq(null);
    setEditMode(false);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              RFQ Management
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Kelola semua pengajuan RFQ dari klien
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRfqs}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        <SubdomainFilter className="mb-4" />

        {/* Active filter indicator */}
        {statusFilter !== "ALL" && (
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2">
            <Info className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Filter aktif: <Badge variant="secondary" className="ml-1">{statusConfig[statusFilter]?.label || statusFilter}</Badge>
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-6 px-2 text-xs"
              onClick={() => {
                setStatusFilter("ALL");
                // Clear URL status param
                const params = new URLSearchParams(window.location.search);
                params.delete("status");
                router.replace(`/admin/rfqs${params.toString() ? `?${params.toString()}` : ""}`);
              }}
            >
              <X className="h-3 w-3 mr-1" />
              Hapus Filter
            </Button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Cari nama, email, perusahaan, atau ID RFQ..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                searchTimeoutRef.current = setTimeout(() => {
                  setSearchDebounced(e.target.value);
                  setPage(1);
                }, 400);
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="QUOTED">Quoted</SelectItem>
              <SelectItem value="ACCEPTED">Accepted</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                <span className="ml-2 text-sm text-slate-500">
                  Memuat data...
                </span>
              </div>
            ) : rfqs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <FileText className="h-10 w-10 mb-3 text-slate-300" />
                <p className="text-sm">Tidak ada RFQ ditemukan</p>
                {searchDebounced && (
                  <p className="text-xs text-slate-400 mt-1">
                    Coba ubah kata kunci pencarian atau filter status
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Klien</TableHead>
                    <TableHead className="hidden md:table-cell">Folder</TableHead>
                    <TableHead className="hidden md:table-cell text-center">Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rfqs.map((rfq) => {
                    const sc = statusConfig[rfq.status] || statusConfig.DRAFT;
                    const nextActions = nextStatusMap[rfq.status] || [];

                    return (
                      <TableRow
                        key={rfq.id}
                        className={
                          highlightId === rfq.id
                            ? "bg-emerald-50 dark:bg-emerald-950/30"
                            : ""
                        }
                      >
                        <TableCell className="font-mono text-xs text-slate-500">
                          {rfq.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {rfq.client.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {rfq.client.company || rfq.client.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <p className="text-sm text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                            {rfq.folderName}
                          </p>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-center">
                          <Badge variant="outline" className="font-mono">
                            {rfq.items.length}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={sc.variant}>{sc.label}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {formatDate(rfq.submittedAt || rfq.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* View Detail */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => fetchRfqDetail(rfq.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Detail</TooltipContent>
                            </Tooltip>

                            {/* Next Status Action */}
                            {nextActions.map((action) => (
                              <Tooltip key={action.status}>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={
                                      action.status === "QUOTED"
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() => {
                                      if (action.status === "QUOTED") {
                                        openQuoteDialog(rfq);
                                      } else {
                                        // M16: Show confirmation before status change
                                        setConfirmDialog({
                                          open: true,
                                          rfqId: rfq.id,
                                          newStatus: action.status,
                                          label: action.label,
                                        });
                                      }
                                    }}
                                  >
                                    {action.status === "QUOTED" && (
                                      <Send className="mr-1 h-3 w-3" />
                                    )}
                                    {action.label}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Ubah status ke {action.label}
                                </TooltipContent>
                              </Tooltip>
                            ))}

                            {/* Download PDFs */}
                            {rfq.reports.length > 0 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleDownloadPdf(rfq)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Download PDF</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Menampilkan {(page - 1) * 20 + 1}–
              {Math.min(page * 20, pagination.total)} dari {pagination.total} RFQ
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-600">
                Hal {page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ===== RFQ Detail Dialog (FULL WIDTH) ===== */}
        <Dialog
          open={!!selectedRfq}
          onOpenChange={(open) => !open && closeDetailDialog()}
        >
          <DialogContent className="sm:max-w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] w-full max-h-[95vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 [&_th]:whitespace-normal [&_td]:whitespace-normal">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>Detail RFQ</DialogTitle>
                  <DialogDescription>
                    Informasi lengkap pengajuan RFQ
                  </DialogDescription>
                </div>
                {!editMode && selectedRfq && !["QUOTED", "ACCEPTED"].includes(selectedRfq.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      initEditState(selectedRfq);
                      setEditMode(true);
                    }}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit Penawaran
                  </Button>
                )}
                {editMode && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditMode(false);
                        if (selectedRfq) initEditState(selectedRfq);
                      }}
                    >
                      <X className="mr-1 h-3.5 w-3.5" />
                      Batal
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdits}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Simpan Perubahan
                    </Button>
                  </div>
                )}
              </div>
            </DialogHeader>

            {detailLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
              </div>
            ) : selectedRfq ? (
              <div className="space-y-6">
                {/* Status & ID */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">RFQ ID</p>
                    <p className="font-mono text-sm">{selectedRfq.id}</p>
                  </div>
                  <Badge
                    variant={
                      (statusConfig[selectedRfq.status]?.variant || "outline") as
                        | "default"
                        | "secondary"
                        | "destructive"
                        | "outline"
                    }
                    className="text-sm"
                  >
                    {statusConfig[selectedRfq.status]?.label || selectedRfq.status}
                  </Badge>
                </div>

                {/* Client Info — Kontak & Perusahaan */}
                <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    Informasi Klien
                  </h4>
                  {/* Kontak Pribadi */}
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Kontak Pribadi</p>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                      <p className="text-xs text-slate-500">Nama</p>
                      <p className="font-medium">
                        {selectedRfq.companyContactPerson || selectedRfq.client.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="font-medium break-all">{selectedRfq.companyEmail || selectedRfq.client.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Telepon</p>
                      <p className="font-medium">
                        {selectedRfq.client.phone || "-"}
                      </p>
                    </div>
                  </div>
                  {/* Informasi Perusahaan */}
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 border-t pt-3 border-slate-100 dark:border-slate-700/50">Informasi Perusahaan</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Nama Perusahaan</p>
                      <p className="font-medium">
                        {selectedRfq.companyName || selectedRfq.client.company || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Email Perusahaan</p>
                      <p className="font-medium break-all">
                        {selectedRfq.companyEmail || selectedRfq.client.email || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Kontak Person</p>
                      <p className="font-medium">
                        {selectedRfq.companyContactPerson || selectedRfq.client.name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Telepon</p>
                      <p className="font-medium">
                        {selectedRfq.client.phone || "-"}
                      </p>
                    </div>
                    {(selectedRfq.companyAddress || selectedRfq.client.companyAddress) && (
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500">Alamat Perusahaan</p>
                        <p className="font-medium">
                          {selectedRfq.companyAddress || selectedRfq.client.companyAddress}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* RFQ Info */}
                <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    Detail Pengajuan
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Nama Folder</p>
                      <p className="font-medium">
                        {selectedRfq.folderName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total Produk</p>
                      <p className="font-medium">{selectedRfq.totalProducts}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Tanggal Submit</p>
                      <p className="font-medium">
                        {formatDate(selectedRfq.submittedAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Dibuat</p>
                      <p className="font-medium">
                        {formatDate(selectedRfq.createdAt)}
                      </p>
                    </div>
                    {selectedRfq.shippingCity && (
                      <div>
                        <p className="text-xs text-slate-500">Kota Pengiriman</p>
                        <p className="font-medium">{selectedRfq.shippingCity}</p>
                      </div>
                    )}
                    {selectedRfq.shippingAddress && (
                      <div>
                        <p className="text-xs text-slate-500">Alamat Pengiriman</p>
                        <p className="font-medium text-sm">{selectedRfq.shippingAddress}</p>
                      </div>
                    )}
                  </div>
                  {selectedRfq.folderDesc && (
                    <div className="mt-3">
                      <p className="text-xs text-slate-500">Deskripsi</p>
                      <p className="text-sm">{selectedRfq.folderDesc}</p>
                    </div>
                  )}
                </div>

                {/* Items - View Mode or Edit Mode */}
                <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    {editMode ? "Edit Penawaran Per Item" : `Produk yang Diajukan (${selectedRfq.items.length})`}
                  </h4>

                  {!editMode ? (
                    /* View Mode */
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produk</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-right">Harga Satuan</TableHead>
                          <TableHead className="text-center">Diskon</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedRfq.items.map((item) => {
                          // Use resolvedUnitPrice (tier-resolved) when no admin override
                          const effectivePrice = item.unitPrice ?? item.resolvedUnitPrice ?? item.baseUnitPrice ?? 0;
                          // Use resolvedDiscountPercent for tier-based discounts
                          const effectiveDiscount = item.discountPercent ?? item.resolvedDiscountPercent ?? 0;
                          const lineTotal = effectivePrice * item.quantity * (1 - effectiveDiscount / 100);
                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">
                                    {item.productName}
                                    {item.productSerial && (
                                      <span className="ml-1 text-xs text-slate-400">
                                        ({item.productSerial})
                                      </span>
                                    )}
                                  </p>
                                  {item.customNote && (
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      {item.customNote}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-slate-500">
                                {item.subcategory || "-"}
                              </TableCell>
                              <TableCell className="text-center font-mono text-sm">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm">
                                {effectivePrice > 0 ? formatRupiah(effectivePrice) : "-"}
                              </TableCell>
                              <TableCell className="text-center text-sm">
                                {effectiveDiscount > 0 ? (
                                  <Badge variant="secondary" className="text-xs">
                                    {effectiveDiscount}%
                                  </Badge>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm font-medium">
                                {effectivePrice > 0 ? formatRupiah(lineTotal) : "-"}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    /* Edit Mode */
                    <div className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produk</TableHead>
                            <TableHead className="text-center">Qty</TableHead>
                            <TableHead className="text-right">Harga Satuan</TableHead>
                            <TableHead className="text-center">Diskon %</TableHead>
                            <TableHead>Catatan</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedRfq.items.map((item, idx) => {
                            const editItem = editItems[idx];
                            if (!editItem) return null;
                            // In edit mode, use editItem.unitPrice (initialized from resolvedUnitPrice)
                            // Fallback to resolvedUnitPrice then baseUnitPrice
                            const resolvedUnitPrice = item.resolvedUnitPrice;
                            const effectivePrice = editItem.unitPrice || resolvedUnitPrice || item.baseUnitPrice || 0;
                            const lineTotal = effectivePrice * item.quantity * (1 - editItem.discountPercent / 100);
                            return (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-sm">
                                      {item.productName}
                                      {item.productSerial && (
                                        <span className="ml-1 text-xs text-slate-400">
                                          ({item.productSerial})
                                        </span>
                                      )}
                                    </p>
                                    {item.baseUnitPrice != null && (
                                      <p className="text-xs text-slate-400 mt-0.5">
                                        Harga dasar: {formatRupiah(item.resolvedUnitPrice ?? item.baseUnitPrice)}
                                        {(item.resolvedUnitPrice != null && item.baseUnitPrice != null && item.resolvedUnitPrice !== item.baseUnitPrice) && (
                                          <span className="ml-1">(tier {item.quantity}+ pcs)</span>
                                        )}
                                      </p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center font-mono text-sm">
                                  {item.quantity}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Input
                                    type="number"
                                    min={0}
                                    step={1000}
                                    value={editItem.unitPrice}
                                    onChange={(e) => {
                                      const newItems = [...editItems];
                                      newItems[idx] = {
                                        ...newItems[idx],
                                        unitPrice: Math.max(0, Number(e.target.value) || 0),
                                      };
                                      setEditItems(newItems);
                                    }}
                                    className="w-32 text-right font-mono text-sm ml-auto"
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={editItem.discountPercent}
                                    onChange={(e) => {
                                      const newItems = [...editItems];
                                      newItems[idx] = {
                                        ...newItems[idx],
                                        discountPercent: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                                      };
                                      setEditItems(newItems);
                                    }}
                                    className="w-20 text-center text-sm"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="text"
                                    placeholder="Catatan..."
                                    value={editItem.customNote}
                                    onChange={(e) => {
                                      const newItems = [...editItems];
                                      newItems[idx] = {
                                        ...newItems[idx],
                                        customNote: e.target.value,
                                      };
                                      setEditItems(newItems);
                                    }}
                                    className="w-40 text-sm"
                                  />
                                </TableCell>
                                <TableCell className="text-right font-mono text-sm font-medium">
                                  {formatRupiah(lineTotal)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>

                      <Separator />

                      {/* Overall discount & admin notes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="overallDiscount" className="text-sm font-medium">
                            Diskon Keseluruhan (%)
                          </Label>
                          <Input
                            id="overallDiscount"
                            type="number"
                            min={0}
                            max={100}
                            value={editOverallDiscount}
                            onChange={(e) =>
                              setEditOverallDiscount(
                                Math.min(100, Math.max(0, Number(e.target.value) || 0))
                              )
                            }
                            className="mt-1"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Diskon yang diterapkan ke subtotal
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="adminNotes" className="text-sm font-medium">
                            Catatan Admin
                          </Label>
                          <Textarea
                            id="adminNotes"
                            placeholder="Catatan internal untuk penawaran ini..."
                            value={editAdminNotes}
                            onChange={(e) => setEditAdminNotes(e.target.value)}
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      {/* Shipping cost override */}
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                            Ongkos Kirim (Override)
                          </span>
                          <span className="text-xs text-amber-600 dark:text-amber-400">
                            — Edit ongkir sesuai estimasi aktual
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label htmlFor="shippingCost" className="text-xs font-medium">
                              Biaya Ongkir (Rp)
                            </Label>
                            <Input
                              id="shippingCost"
                              type="number"
                              min={0}
                              step={10000}
                              value={editShippingCost}
                              onChange={(e) =>
                                setEditShippingCost(Math.max(0, Number(e.target.value) || 0))
                              }
                              className="mt-1"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                              onClick={async () => {
                                if (!selectedRfq) return;
                                const shippingCity = selectedRfq.shippingCity || "";
                                if (!shippingCity) {
                                  toast.error("Kota pengiriman tidak tersedia di data RFQ ini");
                                  return;
                                }
                                try {
                                  const totalQty = selectedRfq.items.reduce((s, i) => s + i.quantity, 0);
                                  const res = await fetch(buildApiUrl("/api/admin/estimate-shipping"), {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      city: shippingCity,
                                      itemQuantity: totalQty,
                                    }),
                                  });
                                  if (!res.ok) throw new Error("Gagal mengestimasi ongkir");
                                  const data = await res.json();
                                  setEditShippingCost(data.estimatedCost);
                                  toast.success(`Estimasi ongkir: Rp ${data.estimatedCost.toLocaleString("id-ID")} (${data.confidence} confidence)`, {
                                    description: data.note,
                                  });
                                } catch {
                                  toast.error("Gagal mengestimasi ongkir. Silakan isi manual.");
                                }
                              }}
                            >
                              <Calculator className="h-3.5 w-3.5" />
                              Estimasi Ongkir
                            </Button>
                          </div>
                          <div className="flex items-end">
                            <p className="text-xs text-slate-500">
                              Ongkir bisa berbeda tergantung jumlah, berat, dan waktu. Klik "Estimasi Ongkir" untuk hitung otomatis atau isi manual.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing Summary - always visible when items have prices */}
                {(editMode || selectedRfq.items.some((i) => (i.unitPrice ?? i.baseUnitPrice) != null)) && (
                  <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Calculator className="h-4 w-4 text-slate-500" />
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Ringkasan Harga
                      </h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                        <span className="font-mono">{formatRupiah(calculatedTotals.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          Diskon Keseluruhan ({editMode ? editOverallDiscount : selectedRfq.overallDiscount}%)
                        </span>
                        <span className="font-mono text-red-600">
                          -{formatRupiah(calculatedTotals.overallDiscountAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Ongkos Kirim</span>
                        <span className="font-mono">{formatRupiah(calculatedTotals.shipping)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-base font-bold">
                        <span className="text-slate-900 dark:text-slate-100">Grand Total</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">
                          {formatRupiah(calculatedTotals.grandTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reports / PDFs */}
                {selectedRfq.reports.length > 0 && (
                  <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                      Dokumen & Laporan
                    </h4>
                    <div className="space-y-2">
                      {selectedRfq.reports.map((report) => {
                        const pdfType = report.reportType === "ORIGINAL_REQUEST" ? "raw" : "processed";
                        return (
                          <div
                            key={report.id}
                            className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-900"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-slate-400" />
                              <div>
                                <p className="text-sm font-medium">
                                  {report.reportType === "ORIGINAL_REQUEST"
                                    ? "Raw RFQ (Konfirmasi Pengajuan)"
                                    : "Processed RFQ (Penawaran Resmi)"}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {report.emailSentAt
                                    ? `Email terkirim: ${formatDate(report.emailSentAt)}`
                                    : "Email belum terkirim"}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                try {
                                  // Use dedicated API route for reliable PDF download
                                  const downloadUrl = `/api/admin/rfqs/${selectedRfq!.id}/pdf?type=${pdfType}`;
                                  const res = await fetch(downloadUrl);
                                  if (!res.ok) {
                                    const errData = await res.json().catch(() => ({}));
                                    toast.error((errData as { error?: string }).error || "File PDF tidak ditemukan");
                                    return;
                                  }
                                  const blob = await res.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = pdfType === "raw"
                                    ? `RFQ-Raw-${selectedRfq!.id.slice(0, 8)}.pdf`
                                    : `RFQ-Penawaran-${selectedRfq!.id.slice(0, 8)}.pdf`;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  window.URL.revokeObjectURL(url);
                                } catch {
                                  toast.error("Gagal mengunduh PDF. Silakan coba lagi.");
                                }
                              }}
                            >
                              <Download className="mr-1 h-3.5 w-3.5" />
                              Download
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Admin Notes (view mode) */}
                {!editMode && selectedRfq.adminNotes && (
                  <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Catatan Admin
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                      {selectedRfq.adminNotes}
                    </p>
                  </div>
                )}

                {/* Status Actions */}
                {!editMode && (
                  <div className="flex items-center justify-end gap-2 border-t pt-4">
                    {(nextStatusMap[selectedRfq.status] || []).map((action) => (
                      <Button
                        key={action.status}
                        variant={
                          action.status === "QUOTED" ? "default" : "outline"
                        }
                        onClick={() => {
                          if (action.status === "QUOTED") {
                            setQuoteDialogOpen(true);
                            setQuoteRfq(selectedRfq);
                            setQuoteSalesName("");
                            setQuoteSalesNotes("");
                            const d = new Date();
                            d.setDate(d.getDate() + 30);
                            setQuoteValidUntil(d.toISOString().split("T")[0]);
                          } else {
                            // M16: Show confirmation before status change
                            setConfirmDialog({
                              open: true,
                              rfqId: selectedRfq.id,
                              newStatus: action.status,
                              label: action.label,
                            });
                          }
                        }}
                      >
                        {action.status === "QUOTED" && (
                          <Send className="mr-1.5 h-4 w-4" />
                        )}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* ===== Quote Dialog (for QUOTED status) ===== */}
        <Dialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Kirim Penawaran Resmi</DialogTitle>
              <DialogDescription>
                Status akan diubah ke QUOTED. Sistem akan otomatis membuat PDF
                Penawaran Resmi dan mengirimkannya via email ke klien.
              </DialogDescription>
            </DialogHeader>

            {quoteRfq && (
              <div className="space-y-4">
                <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30">
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                    {quoteRfq.folderName}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    {quoteRfq.client.name} • {quoteRfq.items.length} produk
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="salesName">Nama Sales</Label>
                    <Input
                      id="salesName"
                      placeholder="Nama sales yang menangani"
                      value={quoteSalesName}
                      onChange={(e) => setQuoteSalesName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="validUntil">Berlaku Hingga</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={quoteValidUntil}
                      onChange={(e) => setQuoteValidUntil(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="salesNotes">Catatan Penawaran</Label>
                    <Textarea
                      id="salesNotes"
                      placeholder="Catatan tambahan untuk penawaran (opsional)"
                      rows={3}
                      value={quoteSalesNotes}
                      onChange={(e) => setQuoteSalesNotes(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Upload Tanda Tangan Digital</Label>
                    <DropzoneInput
                      accept="image/png,image/jpeg,image/webp"
                      onFileSelect={(file) => {
                        setQuoteSignatureFile(file);
                        if (file) {
                          const previewUrl = URL.createObjectURL(file);
                          setQuoteSignaturePreview(previewUrl);
                        } else {
                          setQuoteSignaturePreview(null);
                        }
                      }}
                      preview={quoteSignaturePreview}
                      onClearPreview={() => setQuoteSignaturePreview(null)}
                      hint="Upload gambar tanda tangan (PNG/JPG) yang akan ditampilkan di PDF penawaran. File disimpan di server lokal."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setQuoteDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={() =>
                      handleStatusUpdate(quoteRfq.id, "QUOTED", {
                        salesName: quoteSalesName || undefined,
                        salesNotes: quoteSalesNotes || undefined,
                        validUntil: quoteValidUntil || undefined,
                        signatureUrl: "", // Will be set by upload in handleStatusUpdate
                      })
                    }
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-1.5 h-4 w-4" />
                    )}
                    Kirim Penawaran
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* M16: Status change confirmation dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open) setConfirmDialog({ open: false, rfqId: "", newStatus: "", label: "" });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Perubahan Status</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengubah status RFQ menjadi{" "}
              <strong>&quot;{confirmDialog.label}&quot;</strong>?
              {confirmDialog.newStatus === "REJECTED" && (
                <span className="block mt-2 text-destructive">
                  Tindakan ini akan menolak penawaran. Klien akan melihat status &quot;Ditolak&quot;.
                </span>
              )}
              {confirmDialog.newStatus === "ACCEPTED" && (
                <span className="block mt-2 text-emerald-600">
                  Penawaran akan ditandai sebagai diterima.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleStatusUpdate(confirmDialog.rfqId, confirmDialog.newStatus);
                setConfirmDialog({ open: false, rfqId: "", newStatus: "", label: "" });
              }}
              className={cn(
                confirmDialog.newStatus === "REJECTED"
                  ? "bg-destructive text-white hover:bg-destructive/90"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              )}
            >
              Ya, Ubah Status
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
