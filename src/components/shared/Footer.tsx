"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { useTrackEvent } from "@/hooks/use-analytics";
import { AnalyticsEvent } from "@/lib/analytics/gtag";

const footerLinks = [
  {
    title: "Produk",
    links: [
      { label: "Penerangan Jalan Umum", href: "/#produk" },
      { label: "Panel Surya",           href: "/#produk" },
      { label: "Penangkal Petir",       href: "/#produk" },
      { label: "Baterai & Storage",     href: "/#produk" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { label: "Tentang Kami",      href: "/about"          },
      { label: "Portofolio Proyek", href: "/portfolio"      },
      { label: "Sertifikasi",       href: "/certifications" },
      { label: "Hubungi Kami",      href: "/contact"        },
      { label: "Tanya Jawab (FAQ)", href: "/faq"            },
    ],
  },
];

const contactInfo = [
  { icon: MapPin, text: "Jl. Raya Industri No. 88, Surabaya, Jawa Timur 60175" },
  { icon: Phone, text: "+62 31 1234 5678" },
  { icon: Mail, text: "info@dayaberkah.id" },
];

export default function Footer() {
  const trackEvent = useTrackEvent();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <footer className="bg-emerald-900 dark:bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="relative w-9 h-9 overflow-hidden rounded-xl bg-white shadow-sm flex items-center justify-center">
                <Image
                  src="/images/dbsn_logo.png"
                  alt="Logo PT. DBSN"
                  fill
                  sizes="36px"
                  className="object-contain"
                />
              </div>
              <div>
                <div className="font-bold text-white text-sm">DBSN Dayaberkah.id</div>
                <div className="text-xs text-emerald-300">Solusi Energi Indonesia</div>
              </div>
            </div>
            <p className="text-emerald-200 text-sm leading-relaxed">
              Mitra terpercaya dalam solusi energi dan infrastruktur untuk Indonesia since 2009.
              Bersertifikasi SNI, TKDN, LKPP, dan ISO.
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{group.title}</h3>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-emerald-300 hover:text-white text-sm transition-colors duration-200 flex items-center gap-1.5 group"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Kontak</h3>
            <ul className="space-y-3">
              {contactInfo.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-emerald-300" />
                  </div>
                  <span className="text-emerald-200 text-sm leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
            <a href="https://wa.me/6283112345678" target="_blank" rel="noopener noreferrer"
              onClick={() => trackEvent(AnalyticsEvent.CONTACT_CLICK, { contact_type: 'whatsapp', location: 'footer' })}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600/80 hover:bg-green-600 text-white text-sm font-medium transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />Chat WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-emerald-400 text-xs">&copy; {new Date().getFullYear()} PT. Daya Berkah Sentosa Nusantara (DBSN). Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-emerald-400 hover:text-white text-xs transition-colors">Kebijakan Privasi</Link>
            <Link href="/terms" className="text-emerald-400 hover:text-white text-xs transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
