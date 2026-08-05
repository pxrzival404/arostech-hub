"use client";

import Image from "next/image";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ContactBanner } from "@/components/common/ContactBanner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Eye,
  Target,
  Mail,
  Phone,
  MapPin,
  Award,
  Users,
  Briefcase,
  Map,
} from "lucide-react";
import { motion } from "framer-motion";
import type { CompanyInfo } from "@/types";
import { useSpoke } from "@/components/SpokeProvider";
import { SUBDOMAIN_LABELS, type Subdomain } from "@/lib/subdomain";

const stats = [
  { icon: Briefcase, value: "500+", label: "Proyek Selesai" },
  { icon: Users, value: "100+", label: "Klien Puas" },
  { icon: Map, value: "30+", label: "Kota Terjangkau" },
  { icon: Award, value: "15+", label: "Tahun Pengalaman" },
];

const certData = [
  { name: "SNI", image: "/images/cert-sni.png", description: "Standar Nasional Indonesia - Produk memenuhi standar keselamatan dan kinerja nasional" },
  { name: "TKDN", image: "/images/cert-tkdn.png", description: "Tingkat Komponen Dalam Negeri - Mengutamakan komponen produksi dalam negeri" },
];

interface AboutPageClientProps {
  companyInfo: CompanyInfo;
}

export function AboutPageClient({ companyInfo }: AboutPageClientProps) {
  const { subdomain } = useSpoke();
  const label = SUBDOMAIN_LABELS[subdomain];

  // Safe access with fallbacks to prevent runtime errors
  const description = companyInfo?.companyDescription ?? "";
  const vision = companyInfo?.vision ?? "";
  const mission = companyInfo?.mission ?? [];
  const email = companyInfo?.contactEmail ?? "";
  const phone = companyInfo?.contactPhone ?? "";
  const whatsapp = companyInfo?.whatsappNumber ?? "";
  const address = companyInfo?.address ?? "";
  const workingHours = companyInfo?.workingHours ?? "";

  return (
    <div className="pt-20">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-emerald-50 to-background dark:from-emerald-950/30 dark:to-background py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Tentang Kami"
            title="Arostech PJU"
            description="Penyedia solusi Penerangan Jalan Umum terdepan di Indonesia"
          />
        </div>
      </section>

      {/* Company Description */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="aspect-video rounded-xl overflow-hidden border relative">
                <Image
                  src="/images/about-company.webp"
                  alt="Arostech - Daya Berkah Sinergi"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Tentang Perusahaan
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {description}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-12 lg:py-16 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                      <Eye className="size-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Visi</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {vision}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                      <Target className="size-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Misi</h3>
                  </div>
                  <ul className="space-y-3">
                    {mission.map((m, i) => (
                      <li key={i} className="flex items-start gap-3 text-muted-foreground">
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 shrink-0 mt-0.5 hover:bg-emerald-200">
                          {i + 1}
                        </Badge>
                        {m}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Certifications - only SNI + TKDN, horizontal layout */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Sertifikasi"
            title="Sertifikasi & Standar"
            description="Produk kami memenuhi standar nasional dan internasional"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {certData.map((cert, index) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center gap-4 p-5 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="size-16 rounded-lg overflow-hidden flex items-center justify-center bg-white p-2 shrink-0">
                  <Image src={cert.image} alt={cert.name} width={52} height={52} className="object-contain" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-foreground">{cert.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{cert.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Stats */}
      <section className="py-12 lg:py-16 bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex size-14 rounded-full bg-white/20 items-center justify-center mb-4">
                  <stat.icon className="size-7 text-white" />
                </div>
                <div className="text-3xl font-bold text-white sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-emerald-100 text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info - compact, only Email, Phone, Address */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Kontak"
            title="Hubungi Kami"
            description="Kami siap membantu kebutuhan penerangan jalan umum Anda"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <div className="size-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                <Mail className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-foreground">Email</h3>
                <a href={`mailto:${email}`} className="text-xs text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors break-all">
                  {email}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <div className="size-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                <Phone className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-foreground">Telepon</h3>
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-xs text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {phone}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <div className="size-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                <MapPin className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-foreground">Alamat</h3>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-2">
                  {address}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <ContactBanner />
    </div>
  );
}
