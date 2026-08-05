"use client";

import { useState, useEffect, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, Star, Clock, X, MapPin } from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";

const socialProofMessages = [
  { name: "Ahmad", city: "Jakarta", action: "meminta penawaran" },
  { name: "Siti", city: "Surabaya", action: "menghubungi kami" },
  { name: "Budi", city: "Bandung", action: "meminta konsultasi" },
  { name: "Dewi", city: "Semarang", action: "meminta penawaran" },
  { name: "Rudi", city: "Medan", action: "mengirim pesan" },
  { name: "Rina", city: "Makassar", action: "meminta konsultasi" },
];

export default function CTABanner() {
  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [showNotification, setShowNotification] = useState(false);
  const [currentProof, setCurrentProof] = useState<typeof socialProofMessages[0] | null>(null);
  const [proofIndex, setProofIndex] = useState(0);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      setTimeLeft({ hours: Math.floor(diff / (1000 * 60 * 60)), minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)), seconds: Math.floor((diff % (1000 * 60)) / 1000) });
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const showNext = () => { setCurrentProof(socialProofMessages[proofIndex % socialProofMessages.length]); setShowNotification(true); setProofIndex((prev) => prev + 1); };
    const firstTimer = setTimeout(showNext, 4000);
    const interval = setInterval(showNext, 15000);
    const hideTimer = setInterval(() => { setShowNotification(false); }, 9000);
    return () => { clearTimeout(firstTimer); clearInterval(interval); clearInterval(hideTimer); };
  }, [proofIndex]);

  const WA_URL = "https://wa.me/6283112345678?text=Halo%20DBSN%20Dayaberkah.id%2C%20saya%20ingin%20berkonsultasi%20tentang%20proyek.";

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-emerald-800 dark:from-emerald-900 dark:to-emerald-950" />
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")` }} />
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white/10" style={{ width: `${(i % 3) + 1}px`, height: `${(i % 3) + 1}px`, left: `${(i * 10) % 100}%`, top: `${(i * 13) % 100}%`, animation: `float ${(i % 4) + 8}s ease-in-out ${i}s infinite` }} />
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 [text-shadow:0_2px_12px_rgba(0,0,0,0.3)]">
            Siap Memulai Proyek Anda?
          </h2>
          <p className="text-emerald-100 dark:text-emerald-200 text-lg mb-6 max-w-2xl mx-auto">
            Hubungi tim kami untuk konsultasi dan penawaran terbaik sesuai kebutuhan proyek Anda
          </p>

          <div className="mb-8">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-amber-300 text-sm font-medium">Konsultasi gratis terbatas hari ini</span>
                <div className="flex items-center gap-1.5">
                  {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((val, i) => (
                    <Fragment key={`time-group-${i}`}>
                      {i > 0 && <span className="text-white/60 text-xs">:</span>}
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/15 text-white font-bold text-sm">
                        {String(val).padStart(2, "0")}
                      </span>
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => scrollTo("permintaan-penawaran")} size="lg" className="bg-white text-emerald-800 hover:bg-emerald-50 gap-2 min-h-[48px] text-base px-8">
              <FileText className="w-5 h-5" />Ajukan Penawaran
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent border-white/30 text-white hover:bg-white/10 gap-2 min-h-[48px] text-base px-8" asChild>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="w-5 h-5" />Hubungi via WhatsApp
              </a>
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-emerald-200/80">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm sm:text-base">Bergabung dengan 500+ instansi yang telah mempercayai kami</span>
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
        </ScrollReveal>
      </div>

      {/* Social proof floating notification */}
      {showNotification && currentProof && (
        <div className="absolute bottom-6 right-6 z-10 hidden sm:block transition-all duration-400">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-emerald-100 dark:border-emerald-800/50 p-4 max-w-[280px]">
            <button onClick={() => setShowNotification(false)} className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Tutup notifikasi">
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Beberapa saat yang lalu</p>
                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-0.5">{currentProof.name} dari {currentProof.city}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">baru saja {currentProof.action}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
