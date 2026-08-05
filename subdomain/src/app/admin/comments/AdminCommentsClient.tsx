"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Trash2,
  MessageSquare,
  Clock,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSpoke } from "@/components/SpokeProvider";
import { SubdomainFilter } from "@/components/admin/SubdomainFilter";

interface Comment {
  id: string;
  articleId: string;
  name: string;
  email: string;
  content: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: { label: "Menunggu", variant: "outline", icon: Clock },
  APPROVED: { label: "Disetujui", variant: "default", icon: CheckCircle2 },
  REJECTED: { label: "Ditolak", variant: "destructive", icon: XCircle },
};

export function AdminCommentsClient() {
  const searchParams = useSearchParams();
  const { subdomain, isPreviewDomain } = useSpoke();

  const buildApiUrl = (path: string) => {
    if (!isPreviewDomain) return path;
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}subdomain=${subdomain}`;
  };
  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(buildApiUrl(`/api/admin/comments?${params}`));
      if (!res.ok) throw new Error("Gagal memuat data");
      const data = await res.json();
      setComments(data.comments);
      setPagination(data.pagination);
    } catch {
      toast.error("Gagal memuat data komentar");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, subdomain, isPreviewDomain]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleStatusUpdate = async (commentId: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(buildApiUrl("/api/admin/comments"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, status }),
      });
      if (!res.ok) throw new Error("Gagal mengupdate status");
      toast.success(status === "APPROVED" ? "Komentar disetujui" : "Komentar ditolak");
      await fetchComments();
    } catch {
      toast.error("Gagal mengupdate status komentar");
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Yakin ingin menghapus komentar ini?")) return;
    try {
      const res = await fetch(buildApiUrl("/api/admin/comments"), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });
      if (!res.ok) throw new Error("Gagal menghapus");
      toast.success("Komentar dihapus");
      await fetchComments();
    } catch {
      toast.error("Gagal menghapus komentar");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Moderasi Komentar
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Kelola komentar artikel — setujui atau tolak sebelum tampil ke publik
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchComments}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <SubdomainFilter className="mb-4" />

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            <SelectItem value="PENDING">Menunggu</SelectItem>
            <SelectItem value="APPROVED">Disetujui</SelectItem>
            <SelectItem value="REJECTED">Ditolak</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
              <span className="ml-2 text-sm text-slate-500">Memuat data...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <MessageSquare className="h-10 w-10 mb-3 text-slate-300" />
              <p className="text-sm">Tidak ada komentar ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Komentar</TableHead>
                    <TableHead>Artikel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comments.map((comment) => {
                    const sc = statusConfig[comment.status] || statusConfig.PENDING;
                    const Icon = sc.icon;
                    return (
                      <TableRow key={comment.id}>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {comment.name}
                            </p>
                            <p className="text-xs text-slate-500">{comment.email}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                              {comment.content}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500 font-mono">
                          {comment.articleId}
                        </TableCell>
                        <TableCell>
                          <Badge variant={sc.variant} className="gap-1">
                            <Icon className="h-3 w-3" />
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {formatDate(comment.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setSelectedComment(comment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {comment.status !== "APPROVED" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700"
                                onClick={() => handleStatusUpdate(comment.id, "APPROVED")}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            {comment.status !== "REJECTED" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => handleStatusUpdate(comment.id, "REJECTED")}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-red-600"
                              onClick={() => handleDelete(comment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
            {Math.min(page * 20, pagination.total)} dari {pagination.total} komentar
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Sebelumnya
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
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedComment} onOpenChange={(open) => !open && setSelectedComment(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Komentar</DialogTitle>
            <DialogDescription>Informasi lengkap komentar</DialogDescription>
          </DialogHeader>
          {selectedComment && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-500">Nama:</span>{" "}
                  <span className="font-medium">{selectedComment.name}</span>
                </div>
                <div>
                  <span className="text-slate-500">Email:</span>{" "}
                  <span className="font-medium">{selectedComment.email}</span>
                </div>
                <div>
                  <span className="text-slate-500">Artikel:</span>{" "}
                  <span className="font-mono text-xs">{selectedComment.articleId}</span>
                </div>
                <div>
                  <span className="text-slate-500">Status:</span>{" "}
                  <Badge variant={statusConfig[selectedComment.status]?.variant || "outline"}>
                    {statusConfig[selectedComment.status]?.label || selectedComment.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-500">Tanggal:</span>{" "}
                  {formatDate(selectedComment.createdAt)}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-sm whitespace-pre-wrap">{selectedComment.content}</p>
              </div>
              <div className="flex items-center gap-2 border-t pt-4">
                {selectedComment.status !== "APPROVED" && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => {
                      handleStatusUpdate(selectedComment.id, "APPROVED");
                      setSelectedComment(null);
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Setujui
                  </Button>
                )}
                {selectedComment.status !== "REJECTED" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      handleStatusUpdate(selectedComment.id, "REJECTED");
                      setSelectedComment(null);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Tolak
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
