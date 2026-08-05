"use client";

import { useState } from "react";
import { useRFQStore } from "@/lib/rfq-store";
import { RFQCartItem, Product } from "@/types";
import { useSpoke } from "@/components/SpokeProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderPlus, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddToRFQModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

export function AddToRFQModal({
  open,
  onOpenChange,
  product,
}: AddToRFQModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDesc, setNewFolderDesc] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [added, setAdded] = useState(false);

  const { folders, createFolder, addItemToFolder, addItemToRFQ } =
    useRFQStore();
  const { subdomain } = useSpoke();

  const handleAdd = () => {
    const cartItem: RFQCartItem = {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productSerial: product.id.toUpperCase(),
      subcategory: product.subcategory,
      quantity: 1,
    };

    let folderId: string;

    if (showNewFolder && newFolderName.trim()) {
      folderId = createFolder(newFolderName.trim(), newFolderDesc.trim(), subdomain);
      addItemToFolder(folderId, cartItem);
    } else if (selectedFolderId) {
      addItemToFolder(selectedFolderId, cartItem);
    } else {
      addItemToRFQ(cartItem, subdomain);
    }

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onOpenChange(false);
      resetForm();
    }, 1500);
  };

  const resetForm = () => {
    setSelectedFolderId(null);
    setNewFolderName("");
    setNewFolderDesc("");
    setShowNewFolder(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          resetForm();
          setAdded(false);
        }
        onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="size-5 text-emerald-600" />
            Tambah ke Draft RFQ
          </DialogTitle>
          <DialogDescription>
            Pilih folder proyek atau buat baru untuk menambahkan{" "}
            <strong>{product.name}</strong>
          </DialogDescription>
        </DialogHeader>

        {added ? (
          <div className="py-8 text-center">
            <div className="inline-flex size-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 items-center justify-center mb-4">
              <Check className="size-8 text-emerald-600" />
            </div>
            <p className="font-semibold text-foreground">
              Produk berhasil ditambahkan!
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {product.name} telah ditambahkan ke Draft RFQ
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Existing folders */}
            {folders.filter((f) => (f.subdomain || "pju") === subdomain && f.id !== "single-rfq-satuan" && !f.id.startsWith("single-rfq-satuan-")).length > 0 && !showNewFolder && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Pilih Folder Proyek
                </Label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {folders.filter((f) => (f.subdomain || "pju") === subdomain && f.id !== "single-rfq-satuan" && !f.id.startsWith("single-rfq-satuan-")).map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => {
                        setSelectedFolderId(folder.id);
                        setShowNewFolder(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg border transition-colors",
                        selectedFolderId === folder.id
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300"
                          : "border-border hover:border-emerald-300 dark:hover:border-emerald-700"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {folder.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {folder.items.length} produk
                        </span>
                      </div>
                      {folder.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {folder.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* New folder form */}
            {showNewFolder && (
              <div className="space-y-3 p-4 rounded-lg border border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20">
                <Label className="text-sm font-medium">Folder Baru</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Nama folder (mis: Proyek Jalan Sudirman)"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                  />
                  <Input
                    placeholder="Deskripsi (opsional)"
                    value={newFolderDesc}
                    onChange={(e) => setNewFolderDesc(e.target.value)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => setShowNewFolder(false)}
                >
                  Batal
                </Button>
              </div>
            )}

            {/* Create new folder button */}
            {!showNewFolder && (
              <button
                onClick={() => {
                  setShowNewFolder(true);
                  setSelectedFolderId(null);
                }}
                className="flex items-center gap-2 w-full px-4 py-3 rounded-lg border border-dashed border-emerald-300 dark:border-emerald-700 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
              >
                <Plus className="size-4" />
                Buat Folder Baru
              </button>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onOpenChange(false);
                  resetForm();
                }}
              >
                Batal
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleAdd}
              >
                <Plus className="size-4" />
                Tambah
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
