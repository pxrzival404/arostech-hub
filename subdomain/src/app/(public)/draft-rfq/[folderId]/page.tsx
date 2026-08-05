"use client";

import { useState } from "react";
import { SpokeLink as Link } from "@/components/SpokeLink";
import { useParams, useRouter } from "next/navigation";
import { useRFQStore, SINGLE_RFQ_FOLDER_ID } from "@/lib/rfq-store";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RFQTrackingModal } from "@/components/rfq/RFQTrackingModal";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  FolderOpen,
  CheckSquare,
  Square,
  X,
  Send,
  CheckCircle2,
  Search,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default function FolderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params.folderId as string;

  const { folders, updateItemQuantity, removeItemFromFolder, deleteFolder } =
    useRFQStore();

  const folder = folders.find((f) => f.id === folderId);
  const isSubmitted = !!folder?.submittedAt;
  const isSingleRfqFolder = folderId === SINGLE_RFQ_FOLDER_ID;

  // Hold mechanism state
  const [heldItems, setHeldItems] = useState<Set<string>>(new Set());
  const [isHolding, setIsHolding] = useState(false);

  // Tracking modal state
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingRfqId, setTrackingRfqId] = useState<string | null>(null);

  if (!folder) {
    return (
      <div className="pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Folder Tidak Ditemukan
          </h2>
          <p className="text-muted-foreground mb-6">
            Folder yang Anda cari tidak ada atau sudah dihapus.
          </p>
          <Button asChild>
            <Link href="/draft-rfq">Kembali ke Draft RFQ</Link>
          </Button>
        </div>
      </div>
    );
  }

  const toggleHold = (productId: string) => {
    setHeldItems((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        if (next.size === 0) setIsHolding(false);
      } else {
        next.add(productId);
        setIsHolding(true);
      }
      return next;
    });
  };

  const cancelHold = () => {
    setHeldItems(new Set());
    setIsHolding(false);
  };

  const removeHeldItems = () => {
    heldItems.forEach((productId) => {
      removeItemFromFolder(folderId, productId);
    });
    cancelHold();
  };

  const handleQuantityChange = (
    productId: string,
    delta: number,
    currentQty: number
  ) => {
    const newQty = currentQty + delta;
    if (newQty >= 1) {
      updateItemQuantity(folderId, productId, newQty);
    }
  };

  const handleOpenTracking = (rfqId: string) => {
    setTrackingRfqId(rfqId);
    setTrackingOpen(true);
  };

  return (
    <div className="pt-20">
      {/* Breadcrumb */}
      <section className="bg-muted/30 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/draft-rfq"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Draft RFQ
          </Link>
        </div>
      </section>

      {/* Page Header */}
      <section className="bg-gradient-to-b from-emerald-50 to-background dark:from-emerald-950/30 dark:to-background py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                {isSingleRfqFolder ? (
                  <>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                      {folder.items.length} Produk
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 gap-1">
                      <Package className="size-3" />
                      RFQ Satuan
                    </Badge>
                  </>
                ) : (
                  <>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                      {folder.items.length} Produk
                    </Badge>
                    {isSubmitted && (
                      <Badge className="bg-emerald-600 text-white gap-1">
                        <CheckCircle2 className="size-3" />
                        Sudah Diajukan
                      </Badge>
                    )}
                  </>
                )}
              </div>
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
                {folder.name}
              </h1>
              {folder.description && (
                <p className="mt-2 text-muted-foreground">
                  {folder.description}
                </p>
              )}
              {isSubmitted && folder.submittedAt && !isSingleRfqFolder && (
                <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">
                  Diajukan pada {new Date(folder.submittedAt).toLocaleString("id-ID")}
                  {folder.submittedRFQId && (
                    <span className="block font-mono text-xs opacity-70 mt-0.5">
                      RFQ ID: {folder.submittedRFQId}
                    </span>
                  )}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {isSingleRfqFolder ? (
                /* No action buttons for the special folder — items are individually tracked */
                null
              ) : isSubmitted ? (
                <>
                  {folder.submittedRFQId && (
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleOpenTracking(folder.submittedRFQId!)}
                    >
                      <CheckCircle2 className="size-4" />
                      Lacak RFQ
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/products">
                      <FolderOpen className="size-4" />
                      Tambah Produk
                    </Link>
                  </Button>
                  {folder.items.length > 0 && (
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      asChild
                    >
                      <Link href={`/rfq?folder=${folder.id}`}>
                        <Send className="size-4" />
                        Ajukan RFQ
                      </Link>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Hold bar (sticky) — only for non-submitted, non-special folders */}
      <AnimatePresence>
        {!isSubmitted && !isSingleRfqFolder && isHolding && heldItems.size > 0 && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t shadow-lg px-4 py-3"
          >
            <div className="mx-auto max-w-7xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-emerald-600 text-white">
                  {heldItems.size} dipilih
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Pilih produk lalu lakukan aksi
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelHold}
                >
                  <X className="size-4" />
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={removeHeldItems}
                >
                  <Trash2 className="size-4" />
                  Hapus ({heldItems.size})
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items List */}
      <section className="py-12 lg:py-16 bg-background pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {folder.items.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex size-20 rounded-full bg-emerald-100 dark:bg-emerald-900/50 items-center justify-center mb-6">
                {isSubmitted ? (
                  <CheckCircle2 className="size-10 text-emerald-500" />
                ) : (
                  <FolderOpen className="size-10 text-emerald-500" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {isSubmitted ? "RFQ Telah Diajukan" : "Folder Kosong"}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                {isSubmitted
                  ? "Produk dalam folder ini sudah diajukan sebagai RFQ. Anda dapat melacak statusnya di halaman dashboard."
                  : "Tambahkan produk dari halaman katalog produk untuk memulai draft RFQ."}
              </p>
              {isSubmitted ? (
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setTrackingOpen(true)}>
                  Lacak RFQ
                </Button>
              ) : (
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
                  <Link href="/products">Lihat Produk</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {folder.items.map((item, index) => {
                // In the single-RFQ folder, each item is individually submitted
                const itemIsSubmitted = isSingleRfqFolder ? !!item.rfqId : isSubmitted;

                return (
                  <motion.div
                    key={item.rfqId || item.productId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <Card
                      className={cn(
                        "transition-all",
                        !itemIsSubmitted && heldItems.has(item.productId) &&
                          "ring-2 ring-emerald-500 border-emerald-500",
                        itemIsSubmitted && (isSingleRfqFolder
                          ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/5"
                          : "opacity-80")
                      )}
                    >
                      <CardContent className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          {/* Hold checkbox — only for non-submitted, non-special items */}
                          {!itemIsSubmitted && !isSingleRfqFolder && (
                            <button
                              onClick={() => toggleHold(item.productId)}
                              className="shrink-0 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                            >
                              {heldItems.has(item.productId) ? (
                                <CheckSquare className="size-5" />
                              ) : (
                                <Square className="size-5" />
                              )}
                            </button>
                          )}

                          {/* Product info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Link
                                href={`/products/${item.productSlug}`}
                                className="font-medium text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate"
                              >
                                {item.productName}
                              </Link>
                              <Badge
                                variant="outline"
                                className="shrink-0 text-xs border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                              >
                                {item.subcategory}
                              </Badge>
                              {isSingleRfqFolder && itemIsSubmitted && (
                                <Badge className="shrink-0 text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 gap-0.5">
                                  <CheckCircle2 className="size-2.5" />
                                  Terkirim
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Serial: {item.productSerial}
                            </p>
                            {/* Show submission date for individually submitted items */}
                            {isSingleRfqFolder && item.submittedAt && (
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                                Diajukan: {format(new Date(item.submittedAt), "d MMM yyyy, HH:mm", { locale: idLocale })}
                              </p>
                            )}
                          </div>

                          {/* Quantity controls — only for non-submitted, non-special items */}
                          {!itemIsSubmitted && !isSingleRfqFolder && (
                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                variant="outline"
                                size="icon"
                                className="size-8"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.productId,
                                    -1,
                                    item.quantity
                                  )
                                }
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="size-3" />
                              </Button>
                              <Input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (val >= 1) {
                                    updateItemQuantity(
                                      folderId,
                                      item.productId,
                                      val
                                    );
                                  }
                                }}
                                onBlur={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (isNaN(val) || val < 1) {
                                    updateItemQuantity(folderId, item.productId, 1);
                                  }
                                }}
                                className="w-16 h-8 text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="size-8"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.productId,
                                    1,
                                    item.quantity
                                  )
                                }
                              >
                                <Plus className="size-3" />
                              </Button>
                            </div>
                          )}

                          {/* Quantity display for submitted items */}
                          {itemIsSubmitted && (
                            <span className="text-sm text-muted-foreground shrink-0">
                              {item.quantity} unit
                            </span>
                          )}

                          {/* Per-item Lacak Status button — for individually submitted items */}
                          {isSingleRfqFolder && item.rfqId && (
                            <Button
                              size="sm"
                              className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleOpenTracking(item.rfqId!)}
                            >
                              <Search className="size-3.5 mr-1" />
                              Lacak Status
                            </Button>
                          )}

                          {/* Delete button — only for non-submitted, non-special items */}
                          {!itemIsSubmitted && !isSingleRfqFolder && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-destructive shrink-0"
                              onClick={() =>
                                removeItemFromFolder(folderId, item.productId)
                              }
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* RFQ Tracking Modal */}
      <RFQTrackingModal
        rfqId={trackingRfqId}
        open={trackingOpen}
        onOpenChange={setTrackingOpen}
      />
    </div>
  );
}
