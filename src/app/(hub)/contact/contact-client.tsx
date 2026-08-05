"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/shared/Tooltip";
import {
  MapPin, Phone, Mail, Clock, Send, Loader2,
  CheckCircle2, MessageSquare, Check, X, FileText, Building, Landmark, ChevronRight, HelpCircle
} from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import SubpageHero from "@/components/shared/SubpageHero";
import { useTrackEvent } from "@/hooks/use-analytics";
import { AnalyticsEvent } from "@/lib/analytics/gtag";
import { RfqB2BForm } from "@/components/forms/RfqB2BForm";
import { RfqB2GForm } from "@/components/forms/RfqB2GForm";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  if (!phone) return true;
  return /^(\+62|62|0)[0-9]{8,13}$/.test(phone.replace(/[\s-]/g, ""));
}

export default function ContactPage() {
  const trackEvent = useTrackEvent();
  const [activeFormTab, setActiveFormTab] = useState<"general" | "b2b" | "b2g">("general");

  // General Form States
  const [generalForm, setGeneralForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submittingGeneral, setSubmittingGeneral] = useState(false);
  const [submittedGeneral, setSubmittedGeneral] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [generalTouched, setGeneralTouched] = useState<Record<string, boolean>>({});

  const generalEmailValid = useMemo(() => isValidEmail(generalForm.email), [generalForm.email]);
  const generalPhoneValid = useMemo(() => isValidPhone(generalForm.phone), [generalForm.phone]);
  const generalNameValid = useMemo(() => generalForm.name.trim().length >= 2, [generalForm.name]);
  const generalSubjectValid = useMemo(() => generalForm.subject.trim().length >= 3, [generalForm.subject]);
  const generalMessageValid = useMemo(() => generalForm.message.trim().length >= 10, [generalForm.message]);

  const updateGeneralField = (field: string, value: string) => {
    setGeneralForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGeneralBlur = (field: string) => {
    setGeneralTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingGeneral(true);
    setGeneralError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generalForm),
      });
      const data = await res.json();
      if (data.success) {
        setSubmittedGeneral(true);
        trackEvent(AnalyticsEvent.CONTACT_CLICK, { contact_type: 'general_form_submit', location: 'contact_page' });
      } else {
        setGeneralError(data.error || "Terjadi kesalahan. Silakan coba lagi.");
      }
    } catch {
      setGeneralError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setSubmittingGeneral(false);
    }
  };

  const handleRfqSubmit = async (data: unknown) => {
    const res = await fetch("/api/rfq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      throw result.error || new Error("Gagal mengirim penawaran harga.");
    }
    return result.data;
  };

  const generalWAUrl = "https://wa.me/6283112345678?text=" + encodeURIComponent(`Halo DBSN Dayaberkah.id,\n\nNama: ${generalForm.name}\nEmail: ${generalForm.email}\nPesan: ${generalForm.message}`);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 pb-20">
      <SubpageHero
        title="Pusat Kontak & Kemitraan"
        subtitle="Ajukan pertanyaan umum atau kirimkan Permintaan Penawaran Harga (RFQ) resmi secara instan."
        badgeLabel="Hubungi Kami"
        badgeIconName="phone"
      />

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Selector & Active Form (2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            <ScrollReveal delay={0.05}>
              {/* Form Toggles */}
              <div className="grid grid-cols-3 p-1.5 bg-slate-100 dark:bg-gray-900 rounded-2xl border border-slate-200/50 dark:border-gray-800">
                <button
                  onClick={() => setActiveFormTab("general")}
                  className={`flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 min-h-[44px] ${
                    activeFormTab === "general"
                      ? "bg-white dark:bg-gray-850 text-emerald-800 dark:text-emerald-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Pesan Umum</span>
                  <span className="sm:hidden">Umum</span>
                </button>
                <button
                  onClick={() => setActiveFormTab("b2b")}
                  className={`flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 min-h-[44px] ${
                    activeFormTab === "b2b"
                      ? "bg-white dark:bg-gray-850 text-emerald-800 dark:text-emerald-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>RFQ B2B</span>
                </button>
                <button
                  onClick={() => setActiveFormTab("b2g")}
                  className={`flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 min-h-[44px] ${
                    activeFormTab === "b2g"
                      ? "bg-white dark:bg-gray-850 text-emerald-800 dark:text-emerald-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                  }`}
                >
                  <Landmark className="w-4 h-4" />
                  <span>RFQ B2G</span>
                </button>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <Card className="border-emerald-100 dark:border-emerald-800/40 shadow-md bg-white dark:bg-gray-900 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-emerald-600 to-emerald-500" />
                <CardContent className="p-6 sm:p-8">
                  
                  {/* General Inquiry Form */}
                  {activeFormTab === "general" && (
                    <div>
                      {submittedGeneral ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <h3 className="text-xl font-bold text-emerald-950 dark:text-emerald-100">Pesan Terkirim!</h3>
                          <p className="text-sm text-gray-500 max-w-sm">
                            Terima kasih telah menghubungi kami. Tim administrasi kami akan meninjau pesan Anda dan merespons dalam waktu 1x24 jam.
                          </p>
                          <Button
                            variant="outline"
                            className="border-emerald-200 text-emerald-800 hover:bg-emerald-50 mt-4"
                            onClick={() => {
                              setSubmittedGeneral(false);
                              setGeneralForm({ name: "", email: "", phone: "", subject: "", message: "" });
                              setGeneralTouched({});
                            }}
                          >
                            Kirim Pesan Lain
                          </Button>
                        </div>
                      ) : (
                        <form onSubmit={handleGeneralSubmit} className="space-y-5">
                          <div className="border-b border-slate-100 dark:border-gray-850 pb-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Kirim Pesan Umum</h3>
                            <p className="text-xs text-gray-500 mt-1">Gunakan formulir ini untuk konsultasi awal, pertanyaan katalog, atau kemitraan umum.</p>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="gen-name">Nama Lengkap <span className="text-red-500">*</span></Label>
                              <Input
                                id="gen-name"
                                required
                                placeholder="Masukkan nama Anda"
                                value={generalForm.name}
                                onChange={(e) => updateGeneralField("name", e.target.value)}
                                onBlur={() => handleGeneralBlur("name")}
                                className={`min-h-[44px] ${
                                  generalTouched.name && !generalNameValid
                                    ? "border-red-300 focus-visible:ring-red-300"
                                    : generalTouched.name && generalNameValid
                                    ? "border-emerald-300 focus-visible:ring-emerald-300"
                                    : ""
                                }`}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="gen-email">Email Bisnis <span className="text-red-500">*</span></Label>
                              <Input
                                id="gen-email"
                                type="email"
                                required
                                placeholder="email@perusahaan.com"
                                value={generalForm.email}
                                onChange={(e) => updateGeneralField("email", e.target.value)}
                                onBlur={() => handleGeneralBlur("email")}
                                className={`min-h-[44px] ${
                                  generalTouched.email && !generalEmailValid
                                    ? "border-red-300 focus-visible:ring-red-300"
                                    : generalTouched.email && generalEmailValid
                                    ? "border-emerald-300 focus-visible:ring-emerald-300"
                                    : ""
                                }`}
                              />
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="gen-phone">No. Telepon / WhatsApp</Label>
                              <Input
                                id="gen-phone"
                                type="tel"
                                placeholder="+62 812..."
                                value={generalForm.phone}
                                onChange={(e) => updateGeneralField("phone", e.target.value)}
                                onBlur={() => handleGeneralBlur("phone")}
                                className={`min-h-[44px] ${
                                  generalTouched.phone && !generalPhoneValid
                                    ? "border-red-300 focus-visible:ring-red-300"
                                    : generalTouched.phone && generalPhoneValid
                                    ? "border-emerald-300 focus-visible:ring-emerald-300"
                                    : ""
                                }`}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="gen-subject">Perihal <span className="text-red-500">*</span></Label>
                              <Input
                                id="gen-subject"
                                required
                                placeholder="Konsultasi Proyek / Penawaran Produk"
                                value={generalForm.subject}
                                onChange={(e) => updateGeneralField("subject", e.target.value)}
                                onBlur={() => handleGeneralBlur("subject")}
                                className={`min-h-[44px] ${
                                  generalTouched.subject && !generalSubjectValid
                                    ? "border-red-300 focus-visible:ring-red-300"
                                    : generalTouched.subject && generalSubjectValid
                                    ? "border-emerald-300 focus-visible:ring-emerald-300"
                                    : ""
                                }`}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="gen-message">Isi Pesan / Detail Pertanyaan <span className="text-red-500">*</span></Label>
                            <Textarea
                              id="gen-message"
                              required
                              placeholder="Deskripsikan kebutuhan konsultasi atau pertanyaan Anda sedetail mungkin..."
                              value={generalForm.message}
                              onChange={(e) => updateGeneralField("message", e.target.value)}
                              onBlur={() => handleGeneralBlur("message")}
                              rows={5}
                              className={`${
                                generalTouched.message && !generalMessageValid
                                  ? "border-red-300 focus-visible:ring-red-300"
                                  : generalTouched.message && generalMessageValid
                                  ? "border-emerald-300 focus-visible:ring-emerald-300"
                                  : ""
                              }`}
                            />
                          </div>

                          {generalError && <p className="text-sm text-red-600 font-medium">{generalError}</p>}

                          <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button
                              type="submit"
                              disabled={submittingGeneral}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white min-h-[48px] px-6 font-bold flex-1 cursor-pointer"
                            >
                              {submittingGeneral ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                              Kirim via Website
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="border-green-300 text-green-700 hover:bg-green-50/50 min-h-[48px] font-bold flex-1 cursor-pointer"
                              onClick={() => {
                                trackEvent(AnalyticsEvent.CONTACT_CLICK, { contact_type: 'whatsapp', location: 'contact_page' });
                                window.open(generalWAUrl, "_blank");
                              }}
                            >
                              <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                              Kirim via WhatsApp
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {/* B2B RFQ Form */}
                  {activeFormTab === "b2b" && (
                    <div>
                      <div className="border-b border-slate-100 dark:border-gray-850 pb-3 mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Building className="w-5 h-5 text-emerald-700" />
                          Permintaan Penawaran B2B (Bisnis-ke-Bisnis)
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Formulir khusus untuk kontraktor swasta, distributor, dan pengadaan institusi bisnis swasta.</p>
                      </div>
                      <div className="px-1 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 mb-6 flex items-start gap-2.5 p-3.5">
                        <HelpCircle className="w-4.5 h-4.5 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Informasi RFQ Cart</p>
                          <p className="mt-0.5 leading-relaxed">Sebelum mengisi formulir RFQ B2B ini, pastikan Anda telah memasukkan produk yang ingin diajukan ke dalam keranjang belanja. Jika keranjang kosong, tombol penawaran di bawah akan meminta Anda untuk memilih produk terlebih dahulu.</p>
                        </div>
                      </div>
                      <RfqB2BForm onSubmit={handleRfqSubmit} />
                    </div>
                  )}

                  {/* B2G RFQ Form */}
                  {activeFormTab === "b2g" && (
                    <div>
                      <div className="border-b border-slate-100 dark:border-gray-850 pb-3 mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Landmark className="w-5 h-5 text-emerald-700" />
                          Permintaan Penawaran B2G (Pemerintah / LKPP)
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Formulir khusus untuk kedinasan, BUMN, aparatur daerah, atau panitia lelang APBD/APBN.</p>
                      </div>
                      <div className="px-1 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 mb-6 flex items-start gap-2.5 p-3.5">
                        <HelpCircle className="w-4.5 h-4.5 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Informasi RFQ Cart</p>
                          <p className="mt-0.5 leading-relaxed">Sama halnya dengan B2B, keranjang belanja (RFQ Cart) digunakan untuk menampung item yang akan diproses pada form B2G ini. Silakan tambahkan produk PJU, panel surya, penangkal petir, atau baterai terlebih dahulu.</p>
                        </div>
                      </div>
                      <RfqGFormWrapper />
                    </div>
                  )}

                </CardContent>
              </Card>
            </ScrollReveal>
          </div>

          {/* Contact Details & Map (1 Column) */}
          <div className="space-y-6">
            
            {/* Contact Cards */}
            <ScrollReveal delay={0.15}>
              <Card className="border-emerald-100 dark:border-emerald-800/40 shadow-sm dark:bg-gray-800">
                <CardContent className="p-6 space-y-6">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">Detail Kontak</h3>
                  <div className="space-y-5">
                    {[
                      { icon: MapPin, title: "Alamat Kantor Utama", desc: "Jl. Raya Industri No. 88\nSurabaya, Jawa Timur 60175\nIndonesia", link: "https://maps.google.com/?q=-7.2756,112.7421" },
                      { icon: Phone, title: "Telepon / Fax", desc: "+62 31 1234 5678", link: "tel:+623112345678" },
                      { icon: Mail, title: "Email Korporat", desc: "info@dayaberkah.id", link: "mailto:info@dayaberkah.id" },
                      { icon: Clock, title: "Jam Operasional", desc: "Senin - Jumat\n08:00 - 17:00 WIB", link: null },
                    ].map((item) => (
                      <div key={item.title} className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center shrink-0 shadow-sm">
                          <item.icon className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-xs text-emerald-900 dark:text-emerald-100 uppercase tracking-wider">{item.title}</p>
                          {item.link ? (
                            <a
                              href={item.link}
                              target={item.link.startsWith("http") ? "_blank" : undefined}
                              rel="noopener noreferrer"
                              className="text-sm text-gray-600 dark:text-gray-300 mt-1 block hover:text-emerald-600 hover:underline leading-relaxed font-medium whitespace-pre-line"
                            >
                              {item.desc}
                            </a>
                          ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed font-medium whitespace-pre-line">
                              {item.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-emerald-50 dark:border-gray-700/50">
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">Rata-rata tanggapan admin: &lt; 24 jam</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Embedded Google Map */}
            <ScrollReveal delay={0.25}>
              <Card className="border-emerald-100 dark:border-emerald-800/40 shadow-sm dark:bg-gray-800 overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">Lokasi Geografis</h3>
                  <div className="rounded-xl overflow-hidden border border-emerald-50 dark:border-gray-700 aspect-video relative">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63377.7593!2d112.7421!3d-7.2756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7fbf8381ac47f%3A0x3027a76e352be40!2sSurabaya%2C%20Jawa%20Timur!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Lokasi Geografis PT. DBSN Dayaberkah.id"
                      className="w-full h-full"
                    />
                  </div>
                  <a
                    href="https://maps.google.com/?q=-7.2756,112.7421"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 transition-colors"
                  >
                    <MapPin className="w-4 h-4" /> Buka di Google Maps
                  </a>
                </CardContent>
              </Card>
            </ScrollReveal>

          </div>
        </div>
      </main>
    </div>
  );
}

// Helper wrapper to handle typing differences for RfqB2GForm safely
function RfqGFormWrapper() {
  const handleB2GSubmit = async (data: unknown) => {
    const res = await fetch("/api/rfq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      throw result.error || new Error("Gagal mengirim penawaran harga.");
    }
    return result.data;
  };
  return <RfqB2GForm onSubmit={handleB2GSubmit} />;
}
