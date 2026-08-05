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
  CheckCircle2, MessageSquare, Check, X,
} from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { useTrackEvent } from "@/hooks/use-analytics";
import { AnalyticsEvent } from "@/lib/analytics/gtag";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  if (!phone) return true;
  return /^(\+62|62|0)[0-9]{8,13}$/.test(phone.replace(/[\s-]/g, ""));
}

export default function ContactSection() {
  const trackEvent = useTrackEvent();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const emailValid = useMemo(() => isValidEmail(form.email), [form.email]);
  const phoneValid = useMemo(() => isValidPhone(form.phone), [form.phone]);
  const nameValid = useMemo(() => form.name.trim().length >= 2, [form.name]);
  const subjectValid = useMemo(() => form.subject.trim().length >= 3, [form.subject]);
  const messageValid = useMemo(() => form.message.trim().length >= 10, [form.message]);

  const updateField = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  const handleBlur = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  const WA_URL = "https://wa.me/6283112345678?text=" + encodeURIComponent(`Halo DBSN Dayaberkah.id,\n\nNama: ${form.name}\nEmail: ${form.email}\nPesan: ${form.message}`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { setSubmitted(true); } else { setError(data.error || "Terjadi kesalahan. Silakan coba lagi."); }
    } catch { setError("Terjadi kesalahan jaringan. Silakan coba lagi."); } finally { setSubmitting(false); }
  };

  function FieldIndicator({ valid, show }: { valid: boolean; show: boolean }) {
    if (!show) return null;
    return valid ? <Check className="w-4 h-4 text-emerald-500 shrink-0" /> : <X className="w-4 h-4 text-red-400 shrink-0" />;
  }

  return (
    <section id="hubungi-kami" className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal delay={0}>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 mb-4">
              <Phone className="w-3.5 h-3.5 mr-1.5" />Kontak
            </Badge>
            <h2 className="section-heading">Hubungi Kami</h2>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
              Tim kami siap membantu Anda. Silakan hubungi kami melalui form di bawah atau kontak langsung.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <ScrollReveal delay={0.1}>
            <Card className="border-emerald-100 dark:border-emerald-800/50 shadow-sm hover:shadow-md transition-all duration-300 lg:col-span-1 h-full dark:bg-gray-800">
              <CardContent className="p-6 space-y-6">
                <h3 className="font-bold text-emerald-900 dark:text-emerald-100">Informasi Kontak</h3>
                <div className="space-y-5">
                  {[
                    { icon: MapPin, title: "Alammat", desc: "Jl. Raya Industri No. 88\nSurabaya, Jawa Timur 60175\nIndonesia" },
                    { icon: Phone, title: "Telepon", desc: "+62 31 1234 5678" },
                    { icon: Mail, title: "Email", desc: "info@dayaberkah.id" },
                    { icon: Clock, title: "Jam Operasional", desc: "Senin - Jumat\n08:00 - 17:00 WIB" },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-emerald-900 dark:text-emerald-100">{title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 whitespace-pre-line">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Rata-rata respon dalam 24 jam</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-emerald-100 dark:border-emerald-800/50">
                  <a href="https://wa.me/6283112345678?text=Halo%20DBSN%20Dayaberkah.id" target="_blank" rel="noopener noreferrer"
                    onClick={() => trackEvent(AnalyticsEvent.CONTACT_CLICK, { contact_type: 'whatsapp', location: 'contact_info_box' })}
                    className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors group min-h-[44px]">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Chat via WhatsApp</p>
                      <p className="text-xs text-green-600">Respon cepat 1x24 jam</p>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Contact Form */}
          <ScrollReveal delay={0.2}>
            <Card className="border-emerald-100 dark:border-emerald-800/50 shadow-sm hover:shadow-md transition-all duration-300 lg:col-span-1 h-full dark:bg-gray-800">
              <CardContent className="p-6">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Pesan Terkirim!</h3>
                    <p className="text-sm text-gray-500 text-center">Terima kasih telah menghubungi kami. Tim kami akan segera merespons pesan Anda.</p>
                    <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); setTouched({}); }}>
                      Kirim Pesan Lain
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-2">Kirim Pesan</h3>

                    {/* Quick contact row — one-click alternatives to form fill */}
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <a
                        href="https://wa.me/6283112345678?text=Halo%20DBSN%20Dayaberkah.id"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent(AnalyticsEvent.CONTACT_CLICK, { contact_type: 'whatsapp', location: 'quick_contact_row' })}
                        className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 hover:border-green-400 dark:hover:border-green-600 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all min-h-[72px] group"
                        aria-label="Hubungi via WhatsApp"
                      >
                        <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-semibold text-green-800 dark:text-green-200">WhatsApp</span>
                      </a>
                      <a
                        href="tel:+623112345678"
                        className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all min-h-[72px] group"
                        aria-label="Telepon DBSN Dayaberkah.id"
                      >
                        <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-200">Telepon</span>
                      </a>
                      <a
                        href="mailto:info@dayaberkah.id"
                        className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all min-h-[72px] group"
                        aria-label="Email DBSN Dayaberkah.id"
                      >
                        <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-200">Email</span>
                      </a>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 h-px bg-emerald-100 dark:bg-emerald-800/50" />
                      <span className="text-[11px] text-gray-400 uppercase tracking-wider">atau isi form</span>
                      <div className="flex-1 h-px bg-emerald-100 dark:bg-emerald-800/50" />
                    </div>

                    {[
                      { id: "contact-name", field: "name", label: "Nama", required: true, placeholder: "Nama lengkap Anda", valid: nameValid, type: "text" },
                      { id: "contact-email", field: "email", label: "Email", required: true, placeholder: "email@contoh.com", valid: emailValid, type: "email" },
                      { id: "contact-phone", field: "phone", label: "Telepon", required: false, placeholder: "+62 812 3456 7890", valid: phoneValid, type: "tel" },
                      { id: "contact-subject", field: "subject", label: "Subjek", required: true, placeholder: "Perihal pesan Anda", valid: subjectValid, type: "text" },
                    ].map(({ id, field, label, required, placeholder, valid, type }) => (
                      <div key={field} className="space-y-2">
                        <Label htmlFor={id}>{label}{required && <span className="text-red-500 ml-0.5">*</span>}</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="relative">
                                <Input id={id} type={type} required={required} placeholder={placeholder}
                                  value={form[field as keyof typeof form]}
                                  onChange={(e) => updateField(field, e.target.value)}
                                  onBlur={() => handleBlur(field)}
                                  className={`min-h-[44px] pr-10 ${touched[field] && !valid ? "border-red-300 focus-visible:ring-red-300" : touched[field] && valid ? "border-emerald-300 focus-visible:ring-emerald-300" : ""}`} />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  <FieldIndicator valid={valid} show={!!touched[field]} />
                                </div>
                              </div>
                            </TooltipTrigger>
                            {touched[field] && !valid && (
                              <TooltipContent side="top" className="bg-red-600 text-white">
                                <p>Format tidak valid</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ))}

                    <div className="space-y-2">
                      <Label htmlFor="contact-message">Pesan <span className="text-red-500">*</span></Label>
                      <Textarea id="contact-message" required placeholder="Tulis pesan Anda di sini"
                        value={form.message} onChange={(e) => updateField("message", e.target.value)} onBlur={() => handleBlur("message")}
                        className={`min-h-[120px] ${touched.message && !messageValid ? "border-red-300 focus-visible:ring-red-300" : touched.message && messageValid ? "border-emerald-300 focus-visible:ring-emerald-300" : ""}`} />
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <Button type="submit" disabled={submitting} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white gap-2 min-h-[48px]">
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      Kirim Pesan
                    </Button>
                    <Button type="button" variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50 gap-2 min-h-[48px]"
                      onClick={() => {
                        trackEvent(AnalyticsEvent.CONTACT_CLICK, { contact_type: 'whatsapp', location: 'contact_form_fallback' });
                        window.open(WA_URL, "_blank");
                      }}>
                      <MessageSquare className="w-5 h-5" />Kirim via WhatsApp
                    </Button>
                    <p className="text-xs text-gray-400 text-center">Rata-rata respon dalam 24 jam</p>
                  </form>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Map */}
          <ScrollReveal delay={0.3}>
            <Card className="border-emerald-100 dark:border-emerald-800/50 shadow-sm hover:shadow-md transition-all duration-300 lg:col-span-1 h-full dark:bg-gray-800">
              <CardContent className="p-4 h-full flex flex-col">
                <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-3">Lokasi Kami</h3>
                <div className="rounded-xl overflow-hidden border border-emerald-100 aspect-video">
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63377.7593!2d112.7421!3d-7.2756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7fbf8381ac47f%3A0x3027a76e352be40!2sSurabaya%2C%20Jawa%20Timur!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                    title="Lokasi DBSN Dayaberkah.id - Surabaya" className="w-full h-full" />
                </div>
                <a href="https://maps.google.com/?q=-7.2756,112.7421" target="_blank" rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-800 transition-colors font-medium">
                  <MapPin className="w-4 h-4" />Buka di Google Maps <span aria-hidden="true">&rarr;</span>
                </a>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
