"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SpokeLink as Link } from "@/components/SpokeLink";
import { useRFQStore } from "@/lib/rfq-store";
import { ClientData, Product } from "@/types";
import { companyInfo } from "@/data/company";
import { useSpoke } from "@/components/SpokeProvider";
import { SUBDOMAIN_BRAND_NAMES, type Subdomain } from "@/lib/subdomain";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Send,
  MessageCircle,
  Mail,
  FolderOpen,
  Minus,
  Plus,
  Trash2,
  User,
  Building2,
  Phone,
  MapPin,
  Save,
  CheckCircle2,
  FileText,
  Clock,
  Truck,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";
// NOTE: Pricing engine diimpor di sisi server (rfq-processor.ts) untuk perhitungan internal.
// Estimasi harga TIDAK ditampilkan ke klien di halaman ini sesuai kebijakan:
// klien baru mengetahui harga resmi setelah submit RFQ, melalui PDF yang dikirim via email.
import { useMemo, useEffect, useCallback } from "react";

// Interface for direct product RFQ items (not from folder store)
interface DirectRFQItem {
  productId: string;
  productName: string;
  productSlug: string;
  productSerial: string;
  subcategory: string;
  quantity: number;
}

function RFQPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { subdomain, brandName } = useSpoke();
  const folderId = searchParams.get("folder");
  const productSlug = searchParams.get("product");

  // Detect mode: direct product vs folder-based
  const isDirectProductMode = !!productSlug;

  const {
    folders,
    updateItemQuantity,
    removeItemFromFolder,
    markFolderAsSubmitted,
    addSubmittedSingleItem,
    savedClientData,
    saveClientDataForNext,
    setSavedClientData,
    setSaveClientDataForNext,
    clearSavedClientData,
  } = useRFQStore();

  const folder = folderId
    ? folders.find((f) => f.id === folderId)
    : folders[0];

  // Direct product RFQ — fetch from Sanity API by slug
  const [directProduct, setDirectProduct] = useState<Product | null>(null);
  const [directProductLoading, setDirectProductLoading] = useState(false);

  // Direct mode items: initialized from product, user can adjust quantity
  const [directItems, setDirectItems] = useState<DirectRFQItem[]>([]);

  // Fetch product from Sanity API when in direct product mode
  const fetchDirectProduct = useCallback(async (slug: string) => {
    setDirectProductLoading(true);
    try {
      const apiUrl = new URL("/api/products/by-slug", window.location.origin);
      apiUrl.searchParams.set("slug", slug);
      apiUrl.searchParams.set("subdomain", subdomain);
      const res = await fetch(apiUrl.pathname + apiUrl.search);
      if (res.ok) {
        const data = await res.json();
        const product: Product = {
          id: data.id,
          name: data.name,
          slug: data.slug,
          category: data.category,
          subcategory: data.subcategory,
          description: data.description,
          specifications: data.specifications || [],
          images: data.images || [],
          highlights: data.highlights || [],
          isHighlight: data.isHighlight || false,
          tags: data.tags || [],
        };
        setDirectProduct(product);
        setDirectItems([
          {
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            productSerial: product.slug,
            subcategory: product.subcategory,
            quantity: 1,
          },
        ]);
      } else {
        setDirectProduct(null);
        setDirectItems([]);
      }
    } catch (error) {
      console.error("[RFQ] Failed to fetch product:", error);
      setDirectProduct(null);
      setDirectItems([]);
    } finally {
      setDirectProductLoading(false);
    }
  }, [subdomain]);

  useEffect(() => {
    if (productSlug) {
      fetchDirectProduct(productSlug);
    }
  }, [productSlug, fetchDirectProduct]);

  const [saveForNext, setSaveForNext] = useState(() => saveClientDataForNext);
  const [submitting, setSubmitting] = useState(false);

  // Initialize client data from saved data (only on mount)
  // Provide defaults for new fields in case saved data is from older version
  const defaultClientData: ClientData = {
    companyName: "",
    companyContactPerson: "",
    companyEmail: "",
    companyAddress: "",
    clientName: "",
    email: "",
    phone: "",
    shippingCity: "",
    shippingAddress: "",
  };

  const [clientData, setClientData] = useState<ClientData>(() =>
    savedClientData
      ? { ...defaultClientData, ...savedClientData }
      : defaultClientData
  );

  const handleClientDataChange = (
    field: keyof ClientData,
    value: string
  ) => {
    setClientData((prev) => ({ ...prev, [field]: value }));
  };

  // Direct mode: quantity management
  const handleDirectQuantityChange = (productId: string, newQty: number) => {
    setDirectItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, newQty) }
          : item
      )
    );
  };

  const isFormValid = () => {
    const baseValid =
      clientData.companyName.trim() &&
      clientData.companyContactPerson.trim() &&
      clientData.companyEmail.trim() &&
      clientData.companyAddress.trim() &&
      clientData.clientName.trim() &&
      clientData.email.trim() &&
      clientData.phone.trim() &&
      clientData.shippingCity.trim() &&
      clientData.shippingAddress.trim();

    if (isDirectProductMode) {
      return baseValid && directItems.length > 0;
    }
    return baseValid && folder && folder.items.length > 0;
  };

  const handleSaveForNextChange = (checked: boolean) => {
    setSaveForNext(checked);
    if (checked) {
      setSavedClientData(clientData);
    } else {
      clearSavedClientData();
    }
    setSaveClientDataForNext(checked);
  };

  // Update saved data when form changes (if save is enabled)
  const handleBlur = () => {
    if (saveForNext) {
      setSavedClientData(clientData);
    }
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedRFQId, setSubmittedRFQId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Total quantity
  const totalQuantity = useMemo(() => {
    if (isDirectProductMode) {
      return directItems.reduce((sum, i) => sum + i.quantity, 0);
    }
    return folder?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  }, [isDirectProductMode, directItems, folder]);

  // Items count
  const itemsCount = isDirectProductMode ? directItems.length : (folder?.items.length ?? 0);

  // Folder name for direct mode
  const effectiveFolderName = isDirectProductMode
    ? `RFQ - ${directProduct?.name || productSlug}`
    : folder?.name || "";

  const handleWhatsAppCTA = () => {
    if (!isFormValid()) return;

    // Save client data first
    if (saveForNext) setSavedClientData(clientData);

    const currentItems = isDirectProductMode ? directItems : (folder?.items || []);

    const lines = [
      `*REQUEST FOR QUOTATION - ${brandName.toUpperCase()}*`,
      ``,
      `*Data Klien:*`,
      `Perusahaan: ${clientData.companyName}`,
      `Contact Person: ${clientData.companyContactPerson}`,
      `Email Perusahaan: ${clientData.companyEmail}`,
      `Alamat: ${clientData.companyAddress}`,
      `Nama Pemesan: ${clientData.clientName}`,
      `Email: ${clientData.email}`,
      `Telepon: ${clientData.phone}`,
      `Kota Pengiriman: ${clientData.shippingCity}`,
      `Alamat Pengiriman: ${clientData.shippingAddress}`,
      ``,
      `*Daftar Produk:*`,
      ...currentItems.map(
        (item, i) =>
          `${i + 1}. ${item.productName} (${item.productSerial}) x${item.quantity}`
      ),
      ``,
      `Total: ${currentItems.length} jenis produk`,
    ];

    const message = encodeURIComponent(lines.join("\n"));
    const waNumber = companyInfo.whatsappNumber;

    window.open(`https://wa.me/${waNumber}?text=${message}`, "_blank");
  };

  const submitRFQ = async () => {
    if (!isFormValid()) return;

    setSubmitting(true);
    setSubmitError(null);
    if (saveForNext) setSavedClientData(clientData);

    try {
      const currentItems = isDirectProductMode ? directItems : (folder?.items || []);
      const currentFolderId = isDirectProductMode
        ? `direct-${productSlug}-${Date.now()}`
        : folder?.id;

      // Build API URL with subdomain for preview domains
      const apiUrl = new URL("/api/rfq", window.location.origin);
      apiUrl.searchParams.set("subdomain", subdomain);

      const response = await fetch(apiUrl.pathname + apiUrl.search, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderId: currentFolderId,
          folderName: effectiveFolderName,
          items: currentItems,
          clientData,
          action: "submit",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.rfqId) {
          setSubmittedRFQId(data.rfqId);
        }
        // Mark the folder as submitted instead of deleting it,
        // so the client can still see the draft with a "submitted" badge
        if (!isDirectProductMode && folder?.id && data.rfqId) {
          markFolderAsSubmitted(folder.id, data.rfqId);
        }
        // For direct (single-product) mode, add the item to the special
        // "RFQ Satuan" tracking folder so the client can track it later
        if (isDirectProductMode && data.rfqId && currentItems.length > 0) {
          const firstItem = currentItems[0];
          addSubmittedSingleItem(
            {
              productId: firstItem.productId,
              productName: firstItem.productName,
              productSlug: firstItem.productSlug,
              productSerial: firstItem.productSerial,
              subcategory: firstItem.subcategory,
              quantity: firstItem.quantity,
            },
            data.rfqId,
            subdomain
          );
        }
        setShowSuccessModal(true);
        setSubmitting(false);
      } else {
        const errData = await response.json().catch(() => ({}));
        setSubmitError(
          errData?.error ||
            "Gagal mengirim RFQ. Silakan coba lagi atau hubungi kami via WhatsApp."
        );
        setSubmitting(false);
      }
    } catch (error) {
      console.error("RFQ submission error:", error);
      setSubmitError(
        "Terjadi kesalahan jaringan. Silakan coba lagi atau hubungi kami via WhatsApp."
      );
      setSubmitting(false);
    }
  };

  // Product loading for direct mode
  if (isDirectProductMode && directProductLoading) {
    return (
      <div className="pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64 mx-auto" />
            <div className="h-4 bg-muted rounded w-48 mx-auto" />
          </div>
          <p className="text-muted-foreground mt-4">Memuat data produk...</p>
        </div>
      </div>
    );
  }

  // Product not found for direct mode
  if (isDirectProductMode && !directProduct && !directProductLoading) {
    return (
      <div className="pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Produk Tidak Ditemukan
          </h2>
          <p className="text-muted-foreground mb-6">
            Produk dengan slug &ldquo;{productSlug}&rdquo; tidak ditemukan dalam katalog kami.
          </p>
          <Button asChild>
            <Link href="/products">Lihat Produk</Link>
          </Button>
        </div>
      </div>
    );
  }

  // No folder for folder-based mode
  if (!isDirectProductMode && !folder) {
    return (
      <div className="pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Tidak Ada Draft RFQ
          </h2>
          <p className="text-muted-foreground mb-6">
            Tambahkan produk ke Draft RFQ terlebih dahulu sebelum mengajukan
            penawaran.
          </p>
          <Button asChild>
            <Link href="/products">Lihat Produk</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      {/* Breadcrumb */}
      <section className="bg-muted/30 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          {isDirectProductMode ? (
            <Link
              href={`/products/${productSlug}`}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="size-4" />
              Kembali ke {directProduct?.name}
            </Link>
          ) : (
            <Link
              href={`/draft-rfq/${folder!.id}`}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="size-4" />
              Kembali ke {folder!.name}
            </Link>
          )}
        </div>
      </section>

      {/* Page Header */}
      <section className="bg-gradient-to-b from-emerald-50 to-background dark:from-emerald-950/30 dark:to-background py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge={isDirectProductMode ? "Penawaran Langsung" : "Ajukan Penawaran"}
            title="Formulir RFQ"
            description={
              isDirectProductMode
                ? `Isi data Anda untuk mengajukan penawaran langsung untuk ${directProduct?.name}`
                : "Isi data klien dan pilih metode pengiriman untuk mengajukan Request for Quotation"
            }
          />
        </div>
      </section>

      {/* Form Content */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Client Data Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Data Perusahaan Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                    Data Perusahaan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">
                        Nama Perusahaan <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="companyName"
                          placeholder="PT. Contoh Perusahaan"
                          value={clientData.companyName}
                          onChange={(e) =>
                            handleClientDataChange("companyName", e.target.value)
                          }
                          onBlur={handleBlur}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyContactPerson">
                        Contact Person Perusahaan <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="companyContactPerson"
                          placeholder="Nama contact person perusahaan"
                          value={clientData.companyContactPerson}
                          onChange={(e) =>
                            handleClientDataChange("companyContactPerson", e.target.value)
                          }
                          onBlur={handleBlur}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyEmail">
                        Email Perusahaan <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="companyEmail"
                          type="email"
                          placeholder="info@perusahaan.com"
                          value={clientData.companyEmail}
                          onChange={(e) =>
                            handleClientDataChange("companyEmail", e.target.value)
                          }
                          onBlur={handleBlur}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyAddress">
                        Alamat Perusahaan <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="companyAddress"
                          placeholder="Jl. Contoh No. 123, Kota"
                          value={clientData.companyAddress}
                          onChange={(e) =>
                            handleClientDataChange("companyAddress", e.target.value)
                          }
                          onBlur={handleBlur}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Pemesan Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="size-5 text-emerald-600 dark:text-emerald-400" />
                    Data Pemesan / Klien
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">
                        Nama Kontak Pemesan <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="clientName"
                          placeholder="Nama lengkap Anda"
                          value={clientData.clientName}
                          onChange={(e) =>
                            handleClientDataChange("clientName", e.target.value)
                          }
                          onBlur={handleBlur}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Nomor Telepon <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+62 812 3456 7890"
                          value={clientData.phone}
                          onChange={(e) =>
                            handleClientDataChange("phone", e.target.value)
                          }
                          onBlur={handleBlur}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email Pemesan <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@perusahaan.com"
                        value={clientData.email}
                        onChange={(e) =>
                          handleClientDataChange("email", e.target.value)
                        }
                        onBlur={handleBlur}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Pengiriman Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Truck className="size-5 text-emerald-600 dark:text-emerald-400" />
                    Data Pengiriman
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="shippingCity">
                      Kota Estimasi Pengiriman <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="shippingCity"
                        placeholder="Kota tujuan pengiriman (misal: Surabaya)"
                        value={clientData.shippingCity}
                        onChange={(e) =>
                          handleClientDataChange("shippingCity", e.target.value)
                        }
                        onBlur={handleBlur}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Kota pengiriman penting untuk perhitungan biaya kirim.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingAddress">
                      Alamat Lengkap Pengiriman <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Textarea
                        id="shippingAddress"
                        placeholder="Alamat lengkap lokasi pengiriman (nama jalan, nomor, kelurahan, kecamatan, kota, provinsi)"
                        value={clientData.shippingAddress}
                        onChange={(e) =>
                          handleClientDataChange("shippingAddress", e.target.value)
                        }
                        onBlur={handleBlur}
                        className="pl-10 min-h-[80px] resize-y"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {isDirectProductMode ? (
                      <Package className="size-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <FolderOpen className="size-5 text-emerald-600 dark:text-emerald-400" />
                    )}
                    Produk yang Diaajukan
                    {isDirectProductMode ? (
                      <Badge
                        variant="outline"
                        className="ml-auto text-xs border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                      >
                        Penawaran Langsung
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="ml-auto text-xs border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                      >
                        {folder!.name}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {isDirectProductMode ? (
                      // Direct product mode: render from directItems
                      directItems.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">
                              {item.productName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.productSerial} &middot; {item.subcategory}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-7"
                              onClick={() =>
                                handleDirectQuantityChange(
                                  item.productId,
                                  item.quantity - 1
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
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val) && val >= 1) {
                                  handleDirectQuantityChange(item.productId, val);
                                }
                              }}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (isNaN(val) || val < 1) {
                                  handleDirectQuantityChange(item.productId, 1);
                                }
                              }}
                              className="w-14 h-7 text-center text-sm font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-7"
                              onClick={() =>
                                handleDirectQuantityChange(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                            >
                              <Plus className="size-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      // Folder mode: render from folder items
                      folder?.items.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">
                              {item.productName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.productSerial} &middot; {item.subcategory}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-7"
                              onClick={() =>
                                updateItemQuantity(
                                  folder.id,
                                  item.productId,
                                  Math.max(1, item.quantity - 1)
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
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val) && val >= 1) {
                                  updateItemQuantity(folder.id, item.productId, val);
                                }
                              }}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (isNaN(val) || val < 1) {
                                  updateItemQuantity(folder.id, item.productId, 1);
                                }
                              }}
                              className="w-14 h-7 text-center text-sm font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-7"
                              onClick={() =>
                                updateItemQuantity(
                                  folder.id,
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                            >
                              <Plus className="size-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              removeItemFromFolder(folder.id, item.productId)
                            }
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Save for next time checkbox */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="saveData"
                  checked={saveForNext}
                  onCheckedChange={(checked) =>
                    handleSaveForNextChange(checked as boolean)
                  }
                />
                <Label
                  htmlFor="saveData"
                  className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="size-3.5" />
                  Simpan data untuk pengajuan berikutnya
                </Label>
              </div>
            </div>

            {/* Right: Submit Actions */}
            <div className="space-y-6">
              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardHeader>
                  <CardTitle className="text-lg">Kirim Penawaran</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    size="lg"
                    disabled={!isFormValid() || submitting}
                    onClick={submitRFQ}
                  >
                    <Send className="size-4" />
                    {submitting ? "Mengirim..." : "Submit RFQ"}
                  </Button>

                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        atau
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    disabled={!isFormValid()}
                    onClick={handleWhatsAppCTA}
                  >
                    <MessageCircle className="size-4" />
                    Tanya via WhatsApp
                  </Button>

                  <p className="text-xs text-muted-foreground text-center pt-2">
                    <strong>Submit RFQ</strong> akan mengirimkan penawaran Anda secara resmi. Tim kami akan memproses dan menghubungi Anda melalui email. Jika ingin bertanya langsung, gunakan opsi WhatsApp.
                  </p>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ringkasan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {isDirectProductMode ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mode</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">Penawaran Langsung</span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Folder</span>
                      <span className="font-medium">{folder.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total Jenis Produk
                    </span>
                    <span className="font-medium">{itemsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Kuantitas</span>
                    <span className="font-medium">
                      {totalQuantity} unit
                    </span>
                  </div>
                  {clientData.shippingCity && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kota Pengiriman</span>
                      <span className="font-medium">{clientData.shippingCity}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Info: Alur Pengajuan RFQ (tanpa estimasi harga) */}
              <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="size-5 text-emerald-600 dark:text-emerald-400" />
                    Alur Pengajuan RFQ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p className="text-muted-foreground">
                    Setelah Anda submit, tim kami akan memproses permintaan dan
                    mengirimkan penawaran resmi melalui email. Anda akan menerima
                    <strong className="text-foreground"> 2 dokumen PDF</strong>:
                  </p>

                  <div className="space-y-3">
                    {/* PDF 1: Raw RFQ */}
                    <div className="flex gap-3 p-3 rounded-lg bg-background border border-emerald-100 dark:border-emerald-900">
                      <div className="shrink-0 size-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-300">
                        1
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-foreground flex items-center gap-1.5">
                          <FileText className="size-4" />
                          Konfirmasi Pengajuan (Raw RFQ)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Dikirim <strong>segera</strong> setelah submit sebagai
                          bukti permintaan Anda telah diterima, berisi daftar
                          produk yang Anda ajukan.
                        </p>
                      </div>
                    </div>

                    {/* PDF 2: Processed RFQ */}
                    <div className="flex gap-3 p-3 rounded-lg bg-background border border-emerald-100 dark:border-emerald-900">
                      <div className="shrink-0 size-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-300">
                        2
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-foreground flex items-center gap-1.5">
                          <Clock className="size-4" />
                          Penawaran Resmi (Processed RFQ)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Dikirim dalam <strong>1x24 jam kerja</strong> setelah
                          review tim sales, berisi harga resmi yang dihitung
                          menggunakan formula di sistem kami.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      <strong>Catatan:</strong> Estimasi harga tidak ditampilkan
                      di halaman ini. Harga resmi hanya akan dikirim melalui
                      email setelah RFQ Anda diproses.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Error toast (jika submit gagal) */}
      {submitError && !showSuccessModal && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm bg-destructive text-destructive-foreground rounded-lg shadow-2xl p-4"
        >
          <p className="text-sm font-medium mb-1">Gagal Submit RFQ</p>
          <p className="text-xs opacity-90">{submitError}</p>
          <button
            onClick={() => setSubmitError(null)}
            className="absolute top-2 right-2 text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Success Pop-up */}
      {showSuccessModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-background rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl my-8"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex size-20 rounded-full bg-emerald-100 dark:bg-emerald-900/50 items-center justify-center mb-4"
              >
                <CheckCircle2 className="size-10 text-emerald-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Pengajuan RFQ Berhasil Dilakukan!
              </h2>
              <p className="text-sm text-muted-foreground">
                Terima kasih telah mengajukan penawaran. Detail pengajuan Anda
                akan dikirim melalui email.
              </p>
            </div>

            {/* RFQ ID */}
            {submittedRFQId && (
              <div className="bg-muted/50 rounded-lg p-3 mb-5 text-left">
                <p className="text-xs text-muted-foreground mb-1">
                  ID Tracking RFQ Anda:
                </p>
                <p className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400 break-all">
                  {submittedRFQId}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Simpan ID ini untuk melacak status RFQ Anda.
                </p>
              </div>
            )}

            {/* Detail: 2 PDF yang akan diterima klien */}
            <div className="space-y-3 mb-6 text-left">
              <p className="text-sm font-medium text-foreground">
                Anda akan menerima 2 dokumen PDF via email:
              </p>

              {/* PDF 1 */}
              <div className="flex gap-3 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20">
                <div className="shrink-0 size-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center">
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">1</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <FileText className="size-4 text-emerald-600" />
                    Konfirmasi Pengajuan (Raw RFQ)
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Dikirim <strong>segera</strong> ke email Anda sebagai bukti
                    permintaan telah diterima.
                  </p>
                </div>
              </div>

              {/* PDF 2 */}
              <div className="flex gap-3 p-3 rounded-lg border border-amber-100 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20">
                <div className="shrink-0 size-8 rounded-full bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center">
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-300">2</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Clock className="size-4 text-amber-600" />
                    Penawaran Resmi (Processed RFQ)
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Dikirim dalam <strong>1x24 jam kerja</strong>, berisi harga
                    resmi yang dihitung dengan formula sistem kami.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {submittedRFQId && (
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  asChild
                >
                  <Link href={`/rfq/success?method=submit&id=${submittedRFQId}`}>
                    Lihat Detail Pengajuan
                  </Link>
                </Button>
              )}
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/">Kembali ke Beranda</Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default function RFQPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="animate-spin size-8 border-2 border-emerald-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <RFQPageContent />
    </Suspense>
  );
}
