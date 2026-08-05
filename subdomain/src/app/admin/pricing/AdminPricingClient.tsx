"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import { useSession } from "next-auth/react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Tag,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Package,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label as UILabel } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { toast } from "sonner";
import { useSpoke } from "@/components/SpokeProvider";
import type { Subdomain } from "@/lib/subdomain";
import { SubdomainFilter } from "@/components/admin/SubdomainFilter";

// === Dynamic Product Data (fetched from Sanity CMS via API) ===

interface DynamicProduct {
  name: string;
  slug: string;
  subcategory: string;
}

interface DynamicCategory {
  name: string;
  slug: string;
}

// === Types ===

interface PricingTier {
  minQuantity: number;
  discountPercent: number;
  tierPrice: number | null;
}

interface PricingEntry {
  id: string;
  label: string;
  scope: "CATEGORY" | "PRODUCT";
  categorySlug: string | null;
  productSlug: string | null;
  pricingType: "FIXED" | "TIERED";
  unitPrice: number;
  installationFee: number;
  active: boolean;
  tiers: PricingTier[];
  createdAt: string;
  updatedAt: string;
}

type TierMode = "discount" | "price";

interface TierFormState extends PricingTier {
  mode: TierMode;
}

interface FormData {
  label: string;
  scope: "CATEGORY" | "PRODUCT";
  categorySlug: string;
  productSlug: string;
  pricingType: "FIXED" | "TIERED";
  unitPrice: number;
  installationFee: number;
  active: boolean;
  tiers: TierFormState[];
}

const emptyTier: TierFormState = {
  minQuantity: 1,
  discountPercent: 0,
  tierPrice: null,
  mode: "discount",
};

const emptyForm: FormData = {
  label: "",
  scope: "CATEGORY",
  categorySlug: "",
  productSlug: "",
  pricingType: "FIXED",
  unitPrice: 0,
  installationFee: 0,
  active: true,
  tiers: [{ ...emptyTier }],
};

// === Helpers ===

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Look up product name from dynamic product list */
function getProductName(slug: string, products: DynamicProduct[]): string | null {
  const product = products.find((p) => p.slug === slug);
  return product?.name ?? null;
}

/** Look up category name from dynamic category list */
function getCategoryName(slug: string, categories: DynamicCategory[]): string | null {
  const cat = categories.find((c) => c.slug === slug);
  return cat?.name ?? null;
}

// === Component ===

export function AdminPricingClient() {
  const { data: session } = useSession();
  const { subdomain, isPreviewDomain, brandName } = useSpoke();

  const buildApiUrl = (path: string) => {
    if (!isPreviewDomain) return path;
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}subdomain=${subdomain}`;
  };

  // Dynamic product data from Sanity CMS
  const [dynamicProducts, setDynamicProducts] = useState<DynamicProduct[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState<DynamicCategory[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Fetch products from Sanity via API
  useEffect(() => {
    async function fetchProducts() {
      setProductsLoading(true);
      try {
        const res = await fetch(buildApiUrl("/api/admin/products"));
        if (res.ok) {
          const data = await res.json();
          setDynamicProducts(data.products || []);
          setDynamicCategories(data.subcategories || []);
        }
      } catch (err) {
        console.error("[AdminPricing] Failed to fetch products:", err);
      } finally {
        setProductsLoading(false);
      }
    }
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subdomain, isPreviewDomain]);

  const PRODUCT_CATEGORIES = dynamicCategories;
  const PRODUCTS = dynamicProducts;
  const [pricingList, setPricingList] = useState<PricingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Expanded rows (to show tier details)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch pricing data
  const fetchPricing = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(buildApiUrl("/api/admin/pricing"));
      if (!res.ok) throw new Error("Gagal memuat data harga");
      const data = await res.json();
      setPricingList(Array.isArray(data) ? data : data.pricing ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [subdomain, isPreviewDomain]);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  // Filter state
  const [scopeFilter, setScopeFilter] = useState<"ALL" | "CATEGORY" | "PRODUCT">("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "FIXED" | "TIERED">("ALL");
  // Stats
  const totalPricing = pricingList.length;
  const categoryCount = pricingList.filter((p) => p.scope === "CATEGORY").length;
  const productCount = pricingList.filter((p) => p.scope === "PRODUCT").length;

  // Filtered list
  const filteredPricing = pricingList.filter((p) => {
    if (scopeFilter !== "ALL" && p.scope !== scopeFilter) return false;
    if (typeFilter !== "ALL" && p.pricingType !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesLabel = p.label.toLowerCase().includes(q);
      const matchesSlug = (p.categorySlug ?? p.productSlug ?? "").toLowerCase().includes(q);
      const matchesName = p.scope === "PRODUCT"
        ? (getProductName(p.productSlug ?? "", dynamicProducts) ?? "").toLowerCase().includes(q)
        : (getCategoryName(p.categorySlug ?? "", dynamicCategories) ?? "").toLowerCase().includes(q);
      if (!matchesLabel && !matchesSlug && !matchesName) return false;
    }
    return true;
  });

  // === Form handlers ===

  function openAddDialog() {
    setEditingId(null);
    setForm({ ...emptyForm, tiers: [{ ...emptyTier }] });
    setDialogOpen(true);
  }

  function openEditDialog(entry: PricingEntry) {
    setEditingId(entry.id);
    const tierStates: TierFormState[] =
      entry.tiers && entry.tiers.length > 0
        ? entry.tiers.map((t) => ({
            minQuantity: t.minQuantity,
            discountPercent: t.discountPercent,
            tierPrice: t.tierPrice,
            mode: t.tierPrice != null && t.tierPrice > 0 ? "price" : "discount",
          }))
        : [{ ...emptyTier }];
    setForm({
      label: entry.label,
      scope: entry.scope,
      categorySlug: entry.categorySlug ?? "",
      productSlug: entry.productSlug ?? "",
      pricingType: entry.pricingType,
      unitPrice: entry.unitPrice,
      installationFee: entry.installationFee,
      active: entry.active,
      tiers: tierStates,
    });
    setDialogOpen(true);
  }

  function updateForm<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // When scope changes, auto-fill label if empty
      if (key === "scope") {
        if (value === "CATEGORY" && prev.categorySlug && !prev.label) {
          const catName = getCategoryName(prev.categorySlug, dynamicCategories);
          if (catName) next.label = catName;
        } else if (value === "PRODUCT" && prev.productSlug && !prev.label) {
          const prodName = getProductName(prev.productSlug, dynamicProducts);
          if (prodName) next.label = prodName;
        }
      }
      // When categorySlug changes, auto-fill label
      if (key === "categorySlug" && prev.scope === "CATEGORY") {
        const catName = getCategoryName(value as string, dynamicCategories);
        if (catName && !prev.label) next.label = catName;
      }
      // When productSlug changes, auto-fill label
      if (key === "productSlug" && prev.scope === "PRODUCT") {
        const prodName = getProductName(value as string, dynamicProducts);
        if (prodName && !prev.label) next.label = prodName;
      }
      return next;
    });
  }

  function updateTier(
    index: number,
    field: keyof TierFormState,
    value: number | string | TierMode
  ) {
    setForm((prev) => {
      const newTiers = [...prev.tiers];
      const tier = { ...newTiers[index] };

      if (field === "mode") {
        const mode = value as TierMode;
        tier.mode = mode;
        if (mode === "price") {
          tier.tierPrice = tier.tierPrice ?? 0;
          tier.discountPercent = 0;
        } else {
          tier.tierPrice = null;
          tier.discountPercent = tier.discountPercent || 0;
        }
      } else if (field === "tierPrice") {
        tier.tierPrice = (value as number) > 0 ? (value as number) : null;
      } else {
        (tier as Record<string, unknown>)[field] = value;
      }

      newTiers[index] = tier;
      return { ...prev, tiers: newTiers };
    });
  }

  function addTier() {
    setForm((prev) => ({
      ...prev,
      tiers: [...prev.tiers, { ...emptyTier }],
    }));
  }

  function removeTier(index: number) {
    setForm((prev) => ({
      ...prev,
      tiers: prev.tiers.filter((_, i) => i !== index),
    }));
  }

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // === Save (Add / Edit) ===

  async function handleSave() {
    if (!form.label.trim()) {
      toast.error("Label wajib diisi");
      return;
    }
    if (form.scope === "CATEGORY" && !form.categorySlug.trim()) {
      toast.error("Kategori wajib diisi");
      return;
    }
    if (form.scope === "PRODUCT" && !form.productSlug.trim()) {
      toast.error("Produk wajib diisi");
      return;
    }
    if (form.unitPrice < 0) {
      toast.error("Harga unit tidak boleh negatif");
      return;
    }
    if (form.installationFee < 0) {
      toast.error("Biaya instalasi tidak boleh negatif");
      return;
    }

    // Validate tiers
    if (form.pricingType === "TIERED") {
      for (const tier of form.tiers) {
        if (tier.mode === "price" && (!tier.tierPrice || tier.tierPrice <= 0)) {
          toast.error("Harga per pcs harus diisi untuk tier harga");
          return;
        }
        if (tier.mode === "discount" && tier.discountPercent < 0) {
          toast.error("Diskon tidak boleh negatif");
          return;
        }
      }
    }

    setSaving(true);
    try {
      // Build the payload — convert TierFormState to PricingTier for API
      const tiersPayload =
        form.pricingType === "TIERED"
          ? form.tiers.map((t) => ({
              minQuantity: t.minQuantity,
              discountPercent: t.mode === "discount" ? t.discountPercent : 0,
              tierPrice:
                t.mode === "price" && t.tierPrice && t.tierPrice > 0
                  ? t.tierPrice
                  : null,
            }))
          : [];

      const payload = {
        scope: form.scope,
        pricingType: form.pricingType,
        categorySlug: form.scope === "CATEGORY" ? form.categorySlug : null,
        productSlug: form.scope === "PRODUCT" ? form.productSlug : null,
        label: form.label,
        unitPrice: form.unitPrice,
        installationFee: form.installationFee,
        tiers: tiersPayload,
      };

      const url = editingId
        ? `/api/admin/pricing/${editingId}`
        : "/api/admin/pricing";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(buildApiUrl(url), {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Gagal menyimpan data harga");
      }

      toast.success(
        editingId
          ? "Data harga berhasil diperbarui"
          : "Data harga berhasil ditambahkan"
      );
      setDialogOpen(false);
      fetchPricing();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  // === Delete ===

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(buildApiUrl(`/api/admin/pricing/${deleteId}`), {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Gagal menghapus data harga");
      }
      toast.success("Data harga berhasil dihapus");
      setDeleteId(null);
      fetchPricing();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setDeleting(false);
    }
  }

  // === Render: Loading ===

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <span className="ml-3 text-zinc-600 dark:text-zinc-400">
          Memuat data harga...
        </span>
      </div>
    );
  }

  // === Render: Error ===

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-3 text-red-600">{error}</span>
      </div>
    );
  }

  // === Render: Main ===

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Manajemen Harga
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Kelola daftar harga produk dan kategori PJU Arostech.
          </p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Harga
        </Button>
      </div>

      <SubdomainFilter className="mb-4" />

      {/* Filter Bar (replaces stat boxes) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Cari label, slug..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={scopeFilter} onValueChange={(val) => setScopeFilter(val as typeof scopeFilter)}>
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Cakupan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Cakupan</SelectItem>
            <SelectItem value="CATEGORY">Kategori ({categoryCount})</SelectItem>
            <SelectItem value="PRODUCT">Produk ({productCount})</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val as typeof typeFilter)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Tipe Harga" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Tipe</SelectItem>
            <SelectItem value="FIXED">Tetap</SelectItem>
            <SelectItem value="TIERED">Bertingkat</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results info */}
      {(scopeFilter !== "ALL" || typeFilter !== "ALL") && (
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span>Menampilkan {filteredPricing.length} dari {totalPricing} entri</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => {
              setScopeFilter("ALL");
              setTypeFilter("ALL");
            }}
          >
            Reset Filter
          </Button>
        </div>
      )}

      {/* Pricing Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar Harga</CardTitle>
        </CardHeader>
        <CardContent>
          {pricingList.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 dark:text-zinc-400">
              <DollarSign className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600" />
              <p className="mt-3 text-sm">Belum ada data harga.</p>
              <p className="text-xs">
                Klik &quot;Tambah Harga&quot; untuk menambahkan entri baru.
              </p>
            </div>
          ) : filteredPricing.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 dark:text-zinc-400">
              <Filter className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600" />
              <p className="mt-3 text-sm">Tidak ada data yang cocok dengan filter.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setScopeFilter("ALL");
                  setTypeFilter("ALL");
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
                    <TableHead className="w-8" />
                    <TableHead>Label</TableHead>
                    <TableHead>Cakupan</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead className="text-right">Harga Unit</TableHead>
                    <TableHead className="text-right">Biaya Instalasi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPricing.map((entry) => {
                    const isExpanded = expandedRows.has(entry.id);
                    const displayName =
                      entry.scope === "PRODUCT"
                        ? getProductName(entry.productSlug ?? "", dynamicProducts) ?? entry.label
                        : getCategoryName(entry.categorySlug ?? "", dynamicCategories) ?? entry.label;

                    return (
                      <Fragment key={entry.id}>
                        <TableRow>
                          {/* Expand/collapse for tiered */}
                          <TableCell>
                            {entry.pricingType === "TIERED" &&
                              entry.tiers.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => toggleRow(entry.id)}
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                          </TableCell>
                          {/* Label + slug info */}
                          <TableCell>
                            <div>
                              <span className="font-medium">{displayName}</span>
                              {displayName !== entry.label && (
                                <span className="ml-1 text-xs text-zinc-400">
                                  ({entry.label})
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              {entry.scope === "CATEGORY"
                                ? entry.categorySlug
                                : entry.productSlug}
                            </span>
                          </TableCell>
                          {/* Scope */}
                          <TableCell>
                            <Badge
                              variant={
                                entry.scope === "CATEGORY"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {entry.scope === "CATEGORY" ? "Kategori" : "Produk"}
                            </Badge>
                          </TableCell>
                          {/* Pricing Type */}
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {entry.pricingType === "FIXED"
                                ? "Tetap"
                                : `Bertingkat (${entry.tiers.length} tier)`}
                            </Badge>
                          </TableCell>
                          {/* Unit Price */}
                          <TableCell className="text-right tabular-nums">
                            {formatRupiah(entry.unitPrice)}
                          </TableCell>
                          {/* Installation Fee */}
                          <TableCell className="text-right tabular-nums">
                            {formatRupiah(entry.installationFee)}
                          </TableCell>
                          {/* Actions */}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditDialog(entry)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700"
                                onClick={() => setDeleteId(entry.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {/* Inline tier details — shown right after the product row */}
                        {isExpanded && entry.pricingType === "TIERED" && entry.tiers.length > 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="p-0">
                              <div className="border-t border-zinc-100 bg-zinc-50 px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                                <p className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                  Tingkat Harga — {entry.label}
                                </p>
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                  {entry.tiers.map((tier, idx) => (
                                    <div
                                      key={idx}
                                      className="rounded-md border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
                                    >
                                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                        Min. {tier.minQuantity} pcs
                                      </span>
                                      <div className="mt-1 text-sm font-medium">
                                        {tier.tierPrice != null && tier.tierPrice > 0 ? (
                                          <span className="text-emerald-700 dark:text-emerald-400">
                                            {formatRupiah(tier.tierPrice)}/pcs
                                          </span>
                                        ) : (
                                          <span className="text-amber-700 dark:text-amber-400">
                                            Diskon {tier.discountPercent}%
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* === Add / Edit Dialog === */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Data Harga" : "Tambah Data Harga"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Scope */}
            <div className="space-y-2">
              <UILabel className="text-sm font-medium">Cakupan</UILabel>
              <Select
                value={form.scope}
                onValueChange={(val) =>
                  updateForm("scope", val as "CATEGORY" | "PRODUCT")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih cakupan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CATEGORY">Kategori</SelectItem>
                  <SelectItem value="PRODUCT">Produk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category — shown when scope=CATEGORY */}
            {form.scope === "CATEGORY" && (
              <div className="space-y-2">
                <UILabel className="text-sm font-medium">Kategori</UILabel>
                <Select
                  value={form.categorySlug}
                  onValueChange={(val) => updateForm("categorySlug", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Allow custom slug if not in list */}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Atau ketik slug kustom, cth: pju-led"
                    value={form.categorySlug}
                    onChange={(e) =>
                      updateForm("categorySlug", e.target.value)
                    }
                    className="text-xs"
                  />
                </div>
              </div>
            )}

            {/* Product — shown when scope=PRODUCT */}
            {form.scope === "PRODUCT" && (
              <div className="space-y-2">
                <UILabel className="text-sm font-medium">Produk</UILabel>
                <Select
                  value={form.productSlug}
                  onValueChange={(val) => updateForm("productSlug", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih produk" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCTS.map((prod) => (
                      <SelectItem key={prod.slug} value={prod.slug}>
                        {prod.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Allow custom slug if not in list */}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Atau ketik slug kustom, cth: pju-led-60w"
                    value={form.productSlug}
                    onChange={(e) =>
                      updateForm("productSlug", e.target.value)
                    }
                    className="text-xs"
                  />
                </div>
              </div>
            )}

            {/* Label */}
            <div className="space-y-2">
              <UILabel className="text-sm font-medium">Label</UILabel>
              <Input
                placeholder="Contoh: PJU LED Standar"
                value={form.label}
                onChange={(e) => updateForm("label", e.target.value)}
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Nama yang ditampilkan. Otomatis terisi dari kategori/produk.
              </p>
            </div>

            {/* Pricing Type */}
            <div className="space-y-2">
              <UILabel className="text-sm font-medium">Tipe Harga</UILabel>
              <Select
                value={form.pricingType}
                onValueChange={(val) =>
                  updateForm("pricingType", val as "FIXED" | "TIERED")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih tipe harga" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIXED">Tetap (Fixed)</SelectItem>
                  <SelectItem value="TIERED">Bertingkat (Tiered)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Unit Price */}
            <div className="space-y-2">
              <UILabel className="text-sm font-medium">
                {form.pricingType === "TIERED"
                  ? "Harga Base/Unit (Rp) — acuan untuk diskon %"
                  : "Harga Unit (Rp)"}
              </UILabel>
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={form.unitPrice || ""}
                onChange={(e) =>
                  updateForm("unitPrice", Number(e.target.value) || 0)
                }
              />
              {form.pricingType === "TIERED" && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Harga base ini digunakan sebagai acuan perhitungan diskon %.
                  Jika tier menggunakan &quot;Harga per pcs&quot;, harga base
                  diabaikan untuk tier tersebut.
                </p>
              )}
            </div>

            {/* Installation Fee */}
            <div className="space-y-2">
              <UILabel className="text-sm font-medium">
                Biaya Instalasi (Rp/unit)
              </UILabel>
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={form.installationFee || ""}
                onChange={(e) =>
                  updateForm("installationFee", Number(e.target.value) || 0)
                }
              />
            </div>

            {/* Tiers — shown when pricingType=TIERED */}
            {form.pricingType === "TIERED" && (
              <div className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <UILabel className="text-sm font-semibold">
                    Tingkat Harga (Tiers)
                  </UILabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={addTier}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Tambah Tier
                  </Button>
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Untuk setiap tier, pilih salah satu: &quot;Harga per pcs&quot;
                  (harga langsung) atau &quot;Diskon %&quot; (persentase diskon
                  dari harga base). Jika &quot;Harga per pcs&quot; diisi, diskon
                  % diabaikan.
                </p>

                {form.tiers.length === 0 && (
                  <p className="py-2 text-center text-xs text-zinc-500">
                    Belum ada tier. Klik &quot;Tambah Tier&quot; untuk
                    menambahkan.
                  </p>
                )}

                {form.tiers.map((tier, idx) => (
                  <div
                    key={idx}
                    className="space-y-3 rounded-md border border-zinc-100 p-3 dark:border-zinc-800"
                  >
                    {/* Row 1: Min Quantity + Remove */}
                    <div className="flex items-end gap-3">
                      <div className="flex-1 space-y-1">
                        <UILabel className="text-xs text-zinc-500">
                          Min. Kuantitas
                        </UILabel>
                        <Input
                          type="number"
                          min={1}
                          value={tier.minQuantity || ""}
                          onChange={(e) =>
                            updateTier(
                              idx,
                              "minQuantity",
                              Number(e.target.value) || 1
                            )
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 text-red-500 hover:text-red-700"
                        onClick={() => removeTier(idx)}
                        disabled={form.tiers.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Row 2: Mode selector (Price or Discount) */}
                    <div className="space-y-2">
                      <UILabel className="text-xs font-medium text-zinc-500">
                        Mode Harga Tier
                      </UILabel>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            tier.mode === "price" ? "default" : "outline"
                          }
                          className="flex-1 text-xs"
                          onClick={() => updateTier(idx, "mode", "price")}
                        >
                          Harga per pcs
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            tier.mode === "discount" ? "default" : "outline"
                          }
                          className="flex-1 text-xs"
                          onClick={() => updateTier(idx, "mode", "discount")}
                        >
                          Diskon %
                        </Button>
                      </div>
                    </div>

                    {/* Row 3: Price or Discount input */}
                    {tier.mode === "price" ? (
                      <div className="space-y-1">
                        <UILabel className="text-xs text-zinc-500">
                          Harga per pcs (Rp)
                        </UILabel>
                        <Input
                          type="number"
                          min={0}
                          placeholder="cth: 1350000"
                          value={tier.tierPrice ?? ""}
                          onChange={(e) =>
                            updateTier(
                              idx,
                              "tierPrice",
                              Number(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <UILabel className="text-xs text-zinc-500">
                          Diskon (%)
                        </UILabel>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="cth: 5"
                          value={tier.discountPercent || ""}
                          onChange={(e) =>
                            updateTier(
                              idx,
                              "discountPercent",
                              Number(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dialog Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Batal
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingId ? "Simpan Perubahan" : "Tambah Harga"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* === Delete Confirmation Dialog === */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Apakah Anda yakin ingin menghapus data harga ini? Tindakan ini
            tidak dapat dibatalkan.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
