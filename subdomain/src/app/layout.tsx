import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { getSubdomain } from "@/sanity/client";
import {
  SUBDOMAIN_BRAND_NAMES,
  SUBDOMAIN_TAGLINES,
  type Subdomain,
} from "@/lib/subdomain";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Dynamic metadata based on subdomain */
export async function generateMetadata(): Promise<Metadata> {
  const subdomain = await getSubdomain();
  const brandName = SUBDOMAIN_BRAND_NAMES[subdomain];
  const tagline = SUBDOMAIN_TAGLINES[subdomain];

  const descriptionMap: Record<Subdomain, string> = {
    pju: `${brandName} - Penyedia solusi Penerangan Jalan Umum (PJU) terpercaya di Indonesia. Produk PJU LED, PJU Tenaga Surya, dan Smart PJU bersertifikasi SNI, TKDN, LKPP, dan ISO.`,
    baterai: `${brandName} - Penyedia solusi baterai & penyimpanan energi terpercaya di Indonesia. Baterai 12V, UPS, dan Battery Charger berkualitas tinggi.`,
    solarpanel: `${brandName} - Penyedia solusi panel surya & energi terbarukan terpercaya di Indonesia. Solar panel 5WP hingga 550WP bersertifikasi IEC.`,
    penangkalpetir: `${brandName} - Penyedia solusi penangkal petir & proteksi kilat terpercaya di Indonesia. Penangkal petir ESE bersertifikasi NFC 17-102.`,
  };

  const keywordsMap: Record<Subdomain, string[]> = {
    pju: ["PJU", "Penerangan Jalan Umum", "PJU LED", "PJU Tenaga Surya", "Smart PJU", "Lampu Jalan", "Arostech", "SNI", "TKDN"],
    baterai: ["Baterai", "UPS", "Battery Charger", "Baterai 12V", "VRLA", "AGM", "Arostech", "Penyimpanan Energi"],
    solarpanel: ["Solar Panel", "Panel Surya", "Fotovoltaik", "Energi Terbarukan", "PLTS", "Monocrystalline", "Arostech"],
    penangkalpetir: ["Penangkal Petir", "Proteksi Kilat", "ESE", "NFC 17-102", "Kurn", "Viking", "Erico", "Arostech"],
  };

  return {
    title: `${brandName} - ${tagline}`,
    description: descriptionMap[subdomain],
    keywords: keywordsMap[subdomain],
    authors: [{ name: brandName }],
    openGraph: {
      title: `${brandName} - ${tagline}`,
      description: descriptionMap[subdomain],
      type: "website",
      locale: "id_ID",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
