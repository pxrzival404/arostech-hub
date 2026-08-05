"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Truck,
  DollarSign,
  Filter,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useSpoke } from "@/components/SpokeProvider";
import { SubdomainFilter } from "@/components/admin/SubdomainFilter";

// === Types ===

interface ShippingEntry {
  id: string;
  city: string;
  province: string;
  baseCost: number;
  freeThreshold: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  city: string;
  province: string;
  baseCost: string;
  freeThreshold: string;
  isActive: boolean;
}

const emptyForm: FormData = {
  city: "",
  province: "Jawa Timur",
  baseCost: "",
  freeThreshold: "",
  isActive: true,
};

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

// === Component ===

export function AdminShippingClient() {
  const { data: session } = useSession();
  const { subdomain, isPreviewDomain, brandName } = useSpoke();

  const buildApiUrl = (path: string) => {
    if (!isPreviewDomain) return path;
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}subdomain=${subdomain}`;
  };
  const [shipping, setShipping] = useState<ShippingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ShippingEntry | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<ShippingEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [freeShippingFilter, setFreeShippingFilter] = useState<"ALL" | "YES" | "NO">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // --- Fetch data ---
  const fetchShipping = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(buildApiUrl("/api/admin/shipping"));
      if (!res.ok) throw new Error("Gagal memuat data ongkos kirim");
      const data = await res.json();
      setShipping(data.shipping);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [subdomain, isPreviewDomain]);

  useEffect(() => {
    fetchShipping();
  }, [fetchShipping]);

  // --- Stats ---
  const totalCities = shipping.length;
  const activeCount = shipping.filter((s) => s.isActive).length;
  const withFreeShipping = shipping.filter((s) => s.freeThreshold !== null).length;
  const withoutFreeShipping = shipping.filter((s) => s.freeThreshold === null).length;

  // --- Filtered list ---
  const filteredShipping = shipping.filter((s) => {
    if (statusFilter === "ACTIVE" && !s.isActive) return false;
    if (statusFilter === "INACTIVE" && s.isActive) return false;
    if (freeShippingFilter === "YES" && s.freeThreshold === null) return false;
    if (freeShippingFilter === "NO" && s.freeThreshold !== null) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!s.city.toLowerCase().includes(q) && !s.province.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // --- Dialog handlers ---
  const openAddDialog = () => {
    setEditingEntry(null);
    setForm(emptyForm);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (entry: ShippingEntry) => {
    setEditingEntry(entry);
    setForm({
      city: entry.city,
      province: entry.province,
      baseCost: String(entry.baseCost),
      freeThreshold: entry.freeThreshold !== null ? String(entry.freeThreshold) : "",
      isActive: entry.isActive,
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    // Validate
    if (!form.city.trim()) {
      setFormError("Kota wajib diisi");
      return;
    }
    if (!form.province.trim()) {
      setFormError("Provinsi wajib diisi");
      return;
    }
    const baseCost = parseFloat(form.baseCost);
    if (isNaN(baseCost) || baseCost < 0) {
      setFormError("Biaya dasar harus berupa angka positif");
      return;
    }
    const freeThreshold = form.freeThreshold.trim()
      ? parseFloat(form.freeThreshold)
      : null;
    if (freeThreshold !== null && (isNaN(freeThreshold) || freeThreshold < 0)) {
      setFormError("Ambang batas gratis harus berupa angka positif");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        city: form.city.trim(),
        province: form.province.trim(),
        baseCost,
        freeThreshold,
        isActive: form.isActive,
      };

      let res: Response;
      if (editingEntry) {
        res = await fetch(buildApiUrl(`/api/admin/shipping/${editingEntry.id}`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(buildApiUrl("/api/admin/shipping"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan data");
      }

      setDialogOpen(false);
      await fetchShipping();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Delete handler ---
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(buildApiUrl(`/api/admin/shipping/${deleteTarget.id}`), {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus data");
      }
      setDeleteTarget(null);
      await fetchShipping();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus data");
    } finally {
      setDeleting(false);
    }
  };

  // --- Loading state ---
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <span className="ml-3 text-zinc-600 dark:text-zinc-400">
          Memuat data ongkos kirim...
        </span>
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-3 text-red-600">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Manajemen Ongkos Kirim
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Kelola biaya pengiriman berdasarkan kota untuk produk {brandName}.
          </p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Ongkir
        </Button>
      </div>

      <SubdomainFilter className="mb-4" />

      {/* Filter Bar (replaces stat boxes) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Cari kota, provinsi..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as typeof statusFilter)}>
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            <SelectItem value="ACTIVE">Aktif ({activeCount})</SelectItem>
            <SelectItem value="INACTIVE">Nonaktif ({totalCities - activeCount})</SelectItem>
          </SelectContent>
        </Select>
        <Select value={freeShippingFilter} onValueChange={(val) => setFreeShippingFilter(val as typeof freeShippingFilter)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Gratis Ongkir" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua</SelectItem>
            <SelectItem value="YES">Dengan Gratis ({withFreeShipping})</SelectItem>
            <SelectItem value="NO">Tanpa Gratis ({withoutFreeShipping})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results info */}
      {(statusFilter !== "ALL" || freeShippingFilter !== "ALL" || searchQuery.trim()) && (
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span>Menampilkan {filteredShipping.length} dari {totalCities} kota</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => {
              setStatusFilter("ALL");
              setFreeShippingFilter("ALL");
              setSearchQuery("");
            }}
          >
            Reset Filter
          </Button>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar Ongkos Kirim</CardTitle>
        </CardHeader>
        <CardContent>
          {shipping.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <Truck className="mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600" />
              <p className="text-sm">Belum ada data ongkos kirim.</p>
              <p className="mt-1 text-xs text-zinc-400">
                Klik &quot;Tambah Ongkir&quot; untuk menambahkan kota baru.
              </p>
            </div>
          ) : filteredShipping.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <Filter className="mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600" />
              <p className="text-sm">Tidak ada data yang cocok dengan filter.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setStatusFilter("ALL");
                  setFreeShippingFilter("ALL");
                  setSearchQuery("");
                }}
              >
                Reset Filter
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kota</TableHead>
                    <TableHead>Provinsi</TableHead>
                    <TableHead className="text-right">Biaya Dasar</TableHead>
                    <TableHead className="text-right">Ambang Gratis</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShipping.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {entry.city}
                      </TableCell>
                      <TableCell className="text-zinc-600 dark:text-zinc-400">
                        {entry.province}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(entry.baseCost)}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.freeThreshold !== null ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-mono">
                              {formatRupiah(entry.freeThreshold)}
                            </span>
                            <Badge
                              variant="secondary"
                              className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            >
                              GRATIS
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={entry.isActive ? "default" : "outline"}
                          className={cn(
                            entry.isActive
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                              : "text-zinc-400"
                          )}
                        >
                          {entry.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(entry)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => setDeleteTarget(entry)}
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? "Edit Ongkos Kirim" : "Tambah Ongkos Kirim"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">Kota</Label>
              <Input
                id="city"
                placeholder="Contoh: Surabaya"
                value={form.city}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, city: e.target.value }))
                }
              />
            </div>

            {/* Province */}
            <div className="space-y-2">
              <Label htmlFor="province">Provinsi</Label>
              <Input
                id="province"
                placeholder="Contoh: Jawa Timur"
                value={form.province}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, province: e.target.value }))
                }
              />
            </div>

            {/* Base Cost */}
            <div className="space-y-2">
              <Label htmlFor="baseCost">Biaya Dasar (IDR)</Label>
              <Input
                id="baseCost"
                type="number"
                min="0"
                placeholder="Contoh: 25000"
                value={form.baseCost}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, baseCost: e.target.value }))
                }
              />
            </div>

            {/* Free Threshold */}
            <div className="space-y-2">
              <Label htmlFor="freeThreshold">
                Ambang Batas Gratis (IDR){" "}
                <span className="text-zinc-400 font-normal">— opsional</span>
              </Label>
              <Input
                id="freeThreshold"
                type="number"
                min="0"
                placeholder="Contoh: 500000 (kosongkan jika tidak ada)"
                value={form.freeThreshold}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    freeThreshold: e.target.value,
                  }))
                }
              />
              <p className="text-xs text-zinc-400">
                Pesanan di atas nilai ini akan mendapat gratis ongkir.
              </p>
            </div>

            {/* Active Checkbox */}
            <div className="flex items-center gap-3">
              <Checkbox
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({
                    ...prev,
                    isActive: checked === true,
                  }))
                }
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Aktif
              </Label>
            </div>

            {/* Form Error */}
            {formError && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {formError}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingEntry ? "Simpan Perubahan" : "Tambah"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  Apakah Anda yakin ingin menghapus data ongkir untuk kota{" "}
                  <span className="font-semibold">{deleteTarget?.city}</span>?
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Hapus
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
