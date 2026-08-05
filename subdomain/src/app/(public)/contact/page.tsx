"use client";

import { useState } from "react";
import { companyInfo } from "@/data/company";
import { SectionHeading } from "@/components/common/SectionHeading";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.id.replace("contact-", "")]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!formData.name || !formData.email || !formData.message) {
      setError("Nama, email, dan pesan wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setError(data.error || "Gagal mengirim pesan. Silakan coba lagi.");
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  // Google Maps embed URL using the address
  const mapsEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(companyInfo.address)}&zoom=15`;
  const mapsLinkUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyInfo.address)}`;

  return (
    <div className="pt-20">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-emerald-50 to-background dark:from-emerald-950/30 dark:to-background py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Hubungi Kami"
            title="Kontak"
            description="Hubungi tim kami untuk konsultasi dan penawaran produk PJU"
          />
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Kirim Pesan</CardTitle>
                </CardHeader>
                <CardContent>
                  {success && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 mb-4 flex items-start gap-3">
                      <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                          Pesan berhasil dikirim!
                        </p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                          Kami akan menghubungi Anda segera. Terima kasih.
                        </p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4 flex items-start gap-2 text-sm text-destructive">
                      <AlertCircle className="size-4 shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name">Nama Lengkap *</Label>
                        <Input
                          id="contact-name"
                          placeholder="Nama Anda"
                          className="bg-background"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email">Email *</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          placeholder="email@contoh.com"
                          className="bg-background"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-phone">Nomor Telepon</Label>
                        <Input
                          id="contact-phone"
                          type="tel"
                          placeholder="Nomor telepon Anda"
                          className="bg-background"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-subject">Subjek</Label>
                        <Input
                          id="contact-subject"
                          placeholder="Perihal pesan"
                          className="bg-background"
                          value={formData.subject}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-message">Pesan *</Label>
                      <Textarea
                        id="contact-message"
                        placeholder="Tulis pesan Anda di sini..."
                        rows={5}
                        className="bg-background"
                        value={formData.message}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send className="size-4" />
                          Kirim Pesan
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Contact Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Kontak</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Email — klik buka email client */}
                  <button
                    type="button"
                    onClick={() => window.open(`mailto:${companyInfo.contactEmail}`, "_self")}
                    className="flex items-start gap-4 w-full text-left group"
                  >
                    <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                      <Mail className="size-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Email</h4>
                      <p className="text-sm text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {companyInfo.contactEmail}
                      </p>
                    </div>
                  </button>

                  {/* Telepon — klik copy nomor */}
                  <button
                    type="button"
                    onClick={() => copyToClipboard(companyInfo.contactPhone.replace(/[^0-9+]/g, ""))}
                    className="flex items-start gap-4 w-full text-left group"
                  >
                    <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                      <Phone className="size-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground">Telepon</h4>
                      <div className="flex items-center gap-1">
                        <a
                          href={`tel:${companyInfo.contactPhone.replace(/[^0-9+]/g, "")}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          {companyInfo.contactPhone}
                        </a>
                        <Copy className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </button>

                  {/* WhatsApp — klik buka WhatsApp */}
                  <a
                    href={`https://wa.me/${companyInfo.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 w-full text-left group"
                  >
                    <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                      <MessageCircle className="size-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">WhatsApp</h4>
                      <p className="text-sm text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {companyInfo.contactPhone}
                      </p>
                    </div>
                  </a>

                  {/* Alamat — klik buka Google Maps */}
                  <a
                    href={mapsLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 w-full text-left group"
                  >
                    <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                      <MapPin className="size-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Alamat</h4>
                      <p className="text-sm text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {companyInfo.address}
                      </p>
                    </div>
                  </a>

                  {/* Jam Kerja — merged from separate card */}
                  <div className="flex items-start gap-4 pt-4 mt-4 border-t">
                    <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                      <Clock className="size-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Jam Kerja</h4>
                      <p className="text-sm text-muted-foreground">
                        {companyInfo.workingHours}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* WhatsApp Button - no card wrapper */}
              <WhatsAppButton
                label="Chat WhatsApp Sekarang"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base"
              />
            </motion.div>
          </div>

          {/* Google Maps Embed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-12"
          >
            <Card>
              <CardContent className="p-0 overflow-hidden rounded-xl">
                <iframe
                  src={mapsEmbedUrl}
                  width="100%"
                  height="280"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Arostech"
                  className="w-full"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
