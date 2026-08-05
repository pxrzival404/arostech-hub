"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { FileText, Menu, X } from "lucide-react";
import { useTrackEvent } from "@/hooks/use-analytics";
import { AnalyticsEvent } from "@/lib/analytics/gtag";

const navLinks = [
  { label: "Beranda", href: "/", anchor: "beranda" },
  { label: "Tentang", href: "/about" },
  { label: "Produk", href: "/products" },
  { label: "Portofolio", href: "/portfolio" },
  { label: "Sertifikasi", href: "/certifications" },
  { label: "Kontak", href: "/contact" },
];

export default function Navbar() {
  const trackEvent = useTrackEvent();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (link: typeof navLinks[0], e: React.MouseEvent<HTMLAnchorElement>) => {
    setIsOpen(false);
    if (isHome && link.href === "/" && link.anchor) {
      const el = document.getElementById(link.anchor);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const isSolid = scrolled || !isHome;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isSolid ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-700/50" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="relative w-9 h-9 overflow-hidden rounded-xl bg-white shadow-sm flex items-center justify-center">
              <Image
                src="/images/dbsn_logo.png"
                alt="PT DBSN - Home"
                fill
                sizes="36px"
                className="object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <div className={`font-bold text-sm leading-tight transition-colors duration-300 ${isSolid ? "text-emerald-900 dark:text-emerald-100" : "text-white"}`}>DBSN Dayaberkah.id</div>
              <div className={`text-xs transition-colors duration-300 ${isSolid ? "text-gray-500 dark:text-gray-400" : "text-emerald-300"}`}>Solusi Energi Indonesia</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(link, e)}
                className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
                  isSolid
                    ? "text-gray-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    : "text-white/95 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle className={isSolid ? "min-h-[44px] min-w-[44px] w-11 h-11 text-emerald-700 dark:text-amber-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors duration-200" : "min-h-[44px] min-w-[44px] w-11 h-11 text-white/90 hover:text-white hover:bg-white/10 transition-colors duration-200"} />
            <Link
              href="/contact"
              onClick={() => {
                trackEvent(AnalyticsEvent.CONTACT_CLICK, { contact_type: 'rfq_button', location: 'navbar' });
              }}
              className="hidden sm:flex items-center justify-center h-9 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5 shadow-sm text-sm font-semibold transition"
            >
              <FileText className="w-3.5 h-3.5" />Penawaran
            </Link>
            <button onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                isSolid
                  ? "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  : "text-white hover:bg-white/10"
              }`}
              aria-label="Toggle menu">
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <nav aria-label="Mobile Navigation" className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(link, e)}
              className="block w-full text-left px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => {
              trackEvent(AnalyticsEvent.CONTACT_CLICK, { contact_type: 'rfq_button', location: 'mobile_nav' });
              setIsOpen(false);
            }}
            className="flex items-center justify-center w-full bg-emerald-700 hover:bg-emerald-800 text-white gap-2 mt-2 h-10 rounded-lg text-sm font-semibold transition"
          >
            <FileText className="w-4 h-4" />Ajukan Penawaran
          </Link>
        </nav>
      )}
    </header>
  );
}
