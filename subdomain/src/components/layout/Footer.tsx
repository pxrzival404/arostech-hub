"use client";

import { SpokeLink as Link } from "@/components/SpokeLink";
import Image from "next/image";
import { navigationItems } from "@/config/site";
import { companyInfo } from "@/data/company";
import { useSpoke } from "@/components/SpokeProvider";
import {
  Mail,
  Phone,
  MapPin,
  ExternalLink,
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { brandName, badgeLabel, footerProductLinks, domain } = useSpoke();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/images/logo-arostech.webp"
                alt="Arostech Logo"
                width={28}
                height={28}
                className="shrink-0"
              />
              <span className="text-xl font-bold text-white">Arostech</span>
              <span className="inline-flex items-center rounded-md bg-emerald-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                {badgeLabel}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {companyInfo.companyDescription.substring(0, 120)}...
            </p>
          </div>

          {/* Produk — dynamic per spoke */}
          <div>
            <h3 className="text-white font-semibold mb-4">Produk</h3>
            <ul className="space-y-2">
              {footerProductLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Perusahaan */}
          <div>
            <h3 className="text-white font-semibold mb-4">Perusahaan</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={`https://dayaberkah.id`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1 font-medium"
                >
                  Daya Berkah
                  <ExternalLink className="size-3" />
                </a>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link
                  href="/portfolio"
                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  Portofolio
                </Link>
              </li>
              <li>
                <Link
                  href="/articles"
                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  Artikel
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kontak</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="size-4 mt-0.5 text-emerald-400 shrink-0" />
                <a
                  href={`mailto:${companyInfo.contactEmail}`}
                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  {companyInfo.contactEmail}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="size-4 mt-0.5 text-emerald-400 shrink-0" />
                <a
                  href={`tel:${companyInfo.contactPhone.replace(/\s/g, "")}`}
                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  {companyInfo.contactPhone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="size-4 mt-0.5 text-emerald-400 shrink-0" />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyInfo.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  {companyInfo.address}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} {brandName}. Hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/about"
              className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
            >
              Tentang Kami
            </Link>
            <Link
              href="/contact"
              className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
            >
              Kontak
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
