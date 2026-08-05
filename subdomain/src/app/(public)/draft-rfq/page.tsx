"use client";

import { useState } from "react";
import { SpokeLink as Link } from "@/components/SpokeLink";
import { useRFQStore, SINGLE_RFQ_FOLDER_ID } from "@/lib/rfq-store";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RFQTrackingModal } from "@/components/rfq/RFQTrackingModal";
import { useSpoke } from "@/components/SpokeProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FolderOpen,
  Plus,
  Trash2,
  ArrowRight,
  FileText,
  CheckCircle2,
  Package,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default function DraftRFQPage() {
  const { folders, createFolder, deleteFolder } = useRFQStore();
  const { subdomain } = useSpoke();
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [trackingRfqId, setTrackingRfqId] = useState<string | null>(null);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [singleRfqPage, setSingleRfqPage] = useState(0);
  const SINGLE_RFQ_PER_PAGE = 3;

  const handleOpenTracking = (rfqId: string) => {
    setTrackingRfqId(rfqId);
    setTrackingOpen(true);
  };

  const handleCreate = () => {
    if (newName.trim()) {
      createFolder(newName.trim(), newDesc.trim(), subdomain);
      setNewName("");
      setNewDesc("");
      setCreateOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    deleteFolder(id);
    setDeleteConfirmId(null);
  };

  // Filter folders by current subdomain
  const currentSubdomain = subdomain;
  const subdomainFolders = folders.filter((f) => {
    const folderSubdomain = f.subdomain || "pju";
    return folderSubdomain === currentSubdomain;
  });

  // Separate the special "RFQ Satuan" folder from regular folders
  // The new format uses "single-rfq-satuan-{subdomain}" IDs
  const singleRfqFolderId = `${SINGLE_RFQ_FOLDER_ID}-${currentSubdomain}`;
  const singleRfqFolder = subdomainFolders.find((f) => f.id === singleRfqFolderId)
    || subdomainFolders.find((f) => f.id === SINGLE_RFQ_FOLDER_ID); // legacy fallback
  const regularFolders = subdomainFolders.filter(
    (f) => f.id !== SINGLE_RFQ_FOLDER_ID && !f.id.startsWith(SINGLE_RFQ_FOLDER_ID + "-")
  );
  // Filter out any legacy "submitted-rfqs" or "submitted-rfqs-*" folders
  const displayFolders = regularFolders.filter(
    (f) => f.id !== "submitted-rfqs" && !f.id.startsWith("submitted-rfqs-")
  );

  const totalItems = displayFolders.reduce((sum, f) => sum + f.items.length, 0);
  const singleRfqItemCount = singleRfqFolder?.items.length ?? 0;

  return (
    <div className="pt-20">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-emerald-50 to-background dark:from-emerald-950/30 dark:to-background py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Draft RFQ"
            title="Draft Request for Quotation"
            description="Kelola folder proyek dan produk yang akan diajukan penawaran"
          />
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              Buat Folder Baru
            </Button>
            {subdomainFolders.length > 0 && (
              <Button variant="outline" asChild>
                <Link href="/products">
                  <FolderOpen className="size-4" />
                  Tambah Produk
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      {(displayFolders.length > 0 || (singleRfqFolder && singleRfqItemCount > 0)) && (
        <section className="py-4 bg-muted/30 border-b">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6 text-sm">
              <span className="text-muted-foreground">
                <strong className="text-foreground">{displayFolders.length}</strong>{" "}
                folder proyek
              </span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">
                  {totalItems + singleRfqItemCount}
                </strong>{" "}
                total produk
              </span>
              {singleRfqFolder && singleRfqItemCount > 0 && (
                <span className="text-emerald-600 dark:text-emerald-400">
                  <strong>{singleRfqItemCount}</strong> RFQ satuan terkirim
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── RFQ Satuan Section ──────────────────────────────────────────── */}
      {singleRfqFolder && singleRfqFolder.items.length > 0 && (
        <section className="py-8 lg:py-10 bg-emerald-50/40 dark:bg-emerald-950/10 border-b border-emerald-200/50 dark:border-emerald-800/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center">
                <Package className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  RFQ Satuan
                </h2>
                <p className="text-xs text-muted-foreground">
                  Produk yang diajukan secara individual — lacak status masing-masing
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {singleRfqFolder.items
                .slice(singleRfqPage * SINGLE_RFQ_PER_PAGE, (singleRfqPage + 1) * SINGLE_RFQ_PER_PAGE)
                .map((item, index) => (
                <motion.div
                  key={item.rfqId || item.productId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                >
                  <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-950">
                    <CardContent className="pt-5">
                      <div className="flex items-start gap-3">
                        <div className="size-9 rounded-md bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground text-sm truncate">
                            {item.productName}
                          </h4>
                          <Badge
                            variant="outline"
                            className="mt-1 text-[10px] border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                          >
                            {item.subcategory}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-muted-foreground space-y-0.5">
                        <div className="flex justify-between">
                          <span>Jumlah:</span>
                          <span className="font-medium text-foreground">{item.quantity} unit</span>
                        </div>
                        {item.submittedAt && (
                          <div className="flex justify-between">
                            <span>Diajukan:</span>
                            <span className="font-medium text-foreground">
                              {format(new Date(item.submittedAt), "d MMM yyyy, HH:mm", { locale: idLocale })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Per-item Lacak Status button */}
                      {item.rfqId && (
                        <Button
                          size="sm"
                          className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleOpenTracking(item.rfqId!)}
                        >
                          <Search className="size-3.5 mr-1" />
                          Lacak Status
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pagination for single RFQ items if >3 */}
            {singleRfqFolder.items.length > SINGLE_RFQ_PER_PAGE && (
              <div className="flex items-center justify-center gap-3 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={singleRfqPage === 0}
                  onClick={() => setSingleRfqPage(Math.max(0, singleRfqPage - 1))}
                >
                  Sebelumnya
                </Button>
                <span className="text-sm text-muted-foreground">
                  {singleRfqPage + 1} / {Math.ceil(singleRfqFolder.items.length / SINGLE_RFQ_PER_PAGE)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(singleRfqPage + 1) * SINGLE_RFQ_PER_PAGE >= singleRfqFolder.items.length}
                  onClick={() => setSingleRfqPage(singleRfqPage + 1)}
                >
                  Selanjutnya
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Regular Folders Grid ──────────────────────────────────────────── */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {displayFolders.length === 0 && !(singleRfqFolder && singleRfqFolder.items.length > 0) ? (
            <div className="text-center py-16">
              <div className="inline-flex size-20 rounded-full bg-emerald-100 dark:bg-emerald-900/50 items-center justify-center mb-6">
                <FileText className="size-10 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Belum Ada Draft RFQ
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Mulai dengan membuat folder proyek baru atau tambahkan produk
                langsung dari halaman produk.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus className="size-4" />
                  Buat Folder Baru
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/products">Lihat Produk</Link>
                </Button>
              </div>
            </div>
          ) : displayFolders.length === 0 ? (
            /* Only the single-RFQ folder exists, no regular folders */
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Belum ada folder proyek. Buat folder untuk mengelompokkan produk berdasarkan proyek.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus className="size-4" />
                  Buat Folder Baru
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/products">Lihat Produk</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayFolders.map((folder, index) => (
                <motion.div
                  key={folder.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className={cn(
                    "group hover:shadow-md transition-shadow h-full flex flex-col",
                    folder.submittedAt && "border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/10"
                  )}>
                    <CardContent className="pt-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div className={cn(
                          "size-10 rounded-lg flex items-center justify-center shrink-0",
                          folder.submittedAt
                            ? "bg-emerald-100 dark:bg-emerald-900/60"
                            : "bg-emerald-100 dark:bg-emerald-900/50"
                        )}>
                          {folder.submittedAt ? (
                            <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <FolderOpen className="size-5 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {folder.submittedAt && (
                            <Badge variant="default" className="bg-emerald-600 text-xs gap-1">
                              <CheckCircle2 className="size-3" />
                              Sudah Diajukan
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setDeleteConfirmId(folder.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>

                      <h3 className="font-semibold text-foreground mb-1">
                        {folder.name}
                      </h3>
                      {folder.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {folder.description}
                        </p>
                      )}

                      {/* Submitted info */}
                      {folder.submittedAt && (
                        <div className="text-xs text-emerald-700 dark:text-emerald-400 mb-3 p-2 rounded-md bg-emerald-100/60 dark:bg-emerald-900/30">
                          <span className="font-medium">Diajukan:</span>{" "}
                          {format(new Date(folder.submittedAt), "d MMM yyyy, HH:mm", { locale: idLocale })}
                          {folder.submittedRFQId && (
                            <span className="block mt-0.5 font-mono text-[10px] opacity-70">
                              ID: {folder.submittedRFQId}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-auto pt-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {folder.items.length} produk
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(
                              new Date(folder.updatedAt),
                              "d MMM yyyy",
                              { locale: idLocale }
                            )}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          {folder.submittedAt ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                asChild
                              >
                                <Link href={`/draft-rfq/${folder.id}`}>
                                  Lihat Detail
                                  <ArrowRight className="size-3.5 ml-1" />
                                </Link>
                              </Button>
                              {folder.submittedRFQId && (
                                <Button
                                  size="sm"
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleOpenTracking(folder.submittedRFQId!);
                                  }}
                                >
                                  Lacak RFQ
                                </Button>
                              )}
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                asChild
                              >
                                <Link href={`/draft-rfq/${folder.id}`}>
                                  Lihat Detail
                                  <ArrowRight className="size-3.5 ml-1" />
                                </Link>
                              </Button>
                              {folder.items.length > 0 && (
                                <Button
                                  size="sm"
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                  asChild
                                >
                                  <Link href={`/rfq?folder=${folder.id}`}>
                                    Ajukan
                                  </Link>
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Create Folder Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Folder Proyek Baru</DialogTitle>
            <DialogDescription>
              Folder digunakan untuk mengelompokkan produk berdasarkan proyek
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Folder</label>
              <Input
                placeholder="mis: Proyek Jalan Sudirman"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Deskripsi (opsional)
              </label>
              <Input
                placeholder="mis: Pengadaan PJU untuk Dinas PU"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCreateOpen(false)}
              >
                Batal
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleCreate}
                disabled={!newName.trim()}
              >
                Buat Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Folder?</DialogTitle>
            <DialogDescription>
              Semua produk dalam folder ini akan ikut terhapus. Tindakan ini
              tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteConfirmId(null)}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() =>
                deleteConfirmId && handleDelete(deleteConfirmId)
              }
            >
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* RFQ Tracking Modal */}
      <RFQTrackingModal
        rfqId={trackingRfqId}
        open={trackingOpen}
        onOpenChange={setTrackingOpen}
      />
    </div>
  );
}
