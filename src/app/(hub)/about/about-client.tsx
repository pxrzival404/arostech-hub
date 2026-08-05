"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Eye, Target, Award, TrendingUp, Lightbulb,
  Handshake, Calendar, MapPin, CheckCircle2, Rocket, Users,
} from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { useCounter } from "@/hooks/use-counter";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import SubpageHero from "@/components/shared/SubpageHero";

const managementTeam = [
  { name: "Ir. Darmawan B. Santoso, M.T.", position: "Direktur Utama", desc: "Berpengalaman lebih dari 20 tahun di bidang energi dan infrastruktur. Memimpin visi perusahaan menuju pertumbuhan berkelanjutan." },
  { name: "Hj. Siti Rahayu, S.E., M.M.", position: "Direktur Keuangan", desc: "Ahli manajemen keuangan korporat dengan latar belakang perbankan dan investasi infrastruktur selama 15 tahun." },
  { name: "Budi Prasetyo, S.T., M.Eng.", position: "Direktur Teknis", desc: "Insinyur senior spesialis energi terbarukan. Berpengalaman dalam proyek solar panel dan PJU skala nasional." },
  { name: "Andi Wibowo, S.H., M.H.", position: "Direktur Operasional", desc: "Memimpin operasional dan logistik perusahaan dengan jaringan distribusi yang mencakup seluruh Indonesia." },
];

const companyMilestones = [
  { year: "2009", event: "PT. Daya Berkah Sentosa Nusantara (DBSN) resmi berdiri di Surabaya", icon: Rocket },
  { year: "2012", event: "Memperoleh sertifikasi SNI pertama untuk produk PJU LED", icon: Award },
  { year: "2015", event: "Ekspansi layanan ke 15 kota di Indonesia", icon: MapPin },
  { year: "2018", event: "Sertifikasi ISO 9001:2015 dari TÜV Rheinland", icon: CheckCircle2 },
  { year: "2021", event: "Menyelesaikan 300+ proyek penerangan jalan umum", icon: TrendingUp },
  { year: "2024", event: "Registrasi e-Katalog LKPP & penetrasi 30+ kota", icon: Building2 },
];

const companyStats = [
  { value: 15, suffix: "+", label: "Tahun Pengalaman", icon: Calendar },
  { value: 4, suffix: "", label: "Sertifikasi Utama", icon: Award },
  { value: 30, suffix: "+", label: "Kota Terlayani", icon: MapPin },
  { value: 500, suffix: "+", label: "Proyek Selesai", icon: TrendingUp },
];

function CompanyStatCounter({ value, suffix, icon: Icon, label }: { value: number; suffix: string; icon: typeof Calendar; label: string }) {
  const count = useCounter(value, 2000, true);
  return (
    <div className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-800/50 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900 transition-colors duration-300">
        <Icon className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
      </div>
      <div className="text-3xl font-extrabold text-emerald-900 dark:text-emerald-100">{count}{suffix}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400 leading-tight font-medium">{label}</div>
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.replace(/^(Ir\.|Hj\.|Dr\.)\s*/, "").split(" ");
  const first = parts[0]?.charAt(0) || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) || "" : "";
  return (first + last).toUpperCase();
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <SubpageHero
        title="Membangun Masa Depan Energi Berkelanjutan"
        subtitle="PT. Daya Berkah Sentosa Nusantara (DBSN) adalah pelopor penyedia infrastruktur energi bersih dan teknologi kelistrikan terintegrasi di Indonesia sejak 2009."
        badgeLabel="Tentang Kami"
        badgeIconName="building"
      />

      {/* Stats Counter Section */}
      <section className="py-12 bg-transparent relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal delay={0.1}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {companyStats.map((stat) => (
                <CompanyStatCounter key={stat.label} {...stat} />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Company Profile Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal delay={0.15}>
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/30">
                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Kredibilitas Korporat</span>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
                  PT. Daya Berkah Sentosa Nusantara (DBSN)
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                  Didirikan pada tahun 2009 di Surabaya, PT. Daya Berkah Sentosa Nusantara (DBSN) berkomitmen penuh untuk menghadirkan solusi teknologi energi terbarukan, penerangan jalan umum, proteksi petir, dan penyimpanan daya terintegrasi.
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                  Sebagai mitra strategis instansi pemerintah, BUMN, dan korporasi swasta skala nasional, kami selalu mengutamakan standardisasi bersertifikat tinggi demi mewujudkan kemandirian energi Indonesia yang merata dan berkelanjutan.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  {["SNI Certified", "TKDN Compliance", "LKPP e-Katalog", "ISO 9001:2015"].map((badge) => (
                    <span key={badge} className="px-3.5 py-1.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-semibold">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.25}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Award, title: "Sertifikasi Lengkap", desc: "Produk berstandar SNI dan memiliki tingkat TKDN tinggi untuk pengadaan pemerintah." },
                  { icon: TrendingUp, title: "500+ Proyek Selesai", desc: "Berpengalaman menginstalasi sistem kelistrikan dan PLTS di seluruh kepulauan Indonesia." },
                  { icon: Lightbulb, title: "Teknologi IoT PJU", desc: "Solusi PJU Smart City dengan monitoring daya terpusat secara digital." },
                  { icon: Handshake, title: "Kemitraan Terpercaya", desc: "Membangun ekosistem energi bersama dinas kota dan kontraktor utama nasional." },
                ].map((item) => (
                  <Card key={item.title} className="border-emerald-100 dark:border-emerald-800/40 shadow-sm hover:shadow-md transition-all duration-300 hover:border-emerald-300 dark:bg-gray-800">
                    <CardContent className="p-5 space-y-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Visi & Misi Section */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-900 border-y border-emerald-50 dark:border-emerald-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal delay={0.1}>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 mb-4">
                <Target className="w-3.5 h-3.5 mr-1.5" />Visi & Misi
              </Badge>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                Arah Strategis & Komitmen Kami
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <ScrollReveal delay={0.15}>
              <Card className="border-emerald-100 dark:border-emerald-800 bg-slate-50/50 dark:bg-gray-850 h-full overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-emerald-600 to-amber-500" />
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-950 dark:to-gray-900 flex items-center justify-center shadow-sm">
                      <Eye className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Visi</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed font-medium">
                    Menjadi penyedia solusi energi dan infrastruktur terdepan di Indonesia yang berkomitmen pada kualitas, keberlanjutan, dan inovasi teknologi untuk kemajuan bangsa.
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.25}>
              <Card className="border-emerald-100 dark:border-emerald-800 bg-slate-50/50 dark:bg-gray-850 h-full overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-amber-500 to-emerald-600" />
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-950 dark:to-gray-900 flex items-center justify-center shadow-sm">
                      <Target className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Misi</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Menyediakan produk dan layanan berkualitas tinggi yang memenuhi standar SNI dan internasional.",
                      "Mengembangkan teknologi energi terbarukan yang ramah lingkungan dan berkelanjutan.",
                      "Membangun kemitraan jangka panjang dengan pemerintah dan sektor swasta.",
                      "Meningkatkan TKDN (Tingkat Komponen Dalam Negeri) dalam setiap produk.",
                      "Berkontribusi pada pembangunan infrastruktur Indonesia yang merata.",
                    ].map((misi, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold shrink-0 mt-0.5">{index + 1}</span>
                        <span className="leading-relaxed font-medium">{misi}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Journey Timeline Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal delay={0.1}>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 mb-4">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />Perjalanan Kami
              </Badge>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                Tonggak Sejarah PT. Daya Berkah Sentosa Nusantara (DBSN)
              </h2>
            </div>
          </ScrollReveal>

          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-600 via-amber-400 to-emerald-300 sm:-translate-x-px" />
            <div className="space-y-8">
              {companyMilestones.map((milestone, i) => (
                <ScrollReveal key={milestone.year} delay={i * 0.05}>
                  <div className={`relative flex items-start gap-4 sm:gap-0 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}>
                    <div className="absolute left-4 sm:left-1/2 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white dark:border-gray-900 shadow-sm -translate-x-1.5 sm:-translate-x-1.5 mt-1.5 z-10" />
                    <div className={`ml-10 sm:ml-0 sm:w-[calc(50%-2rem)] ${i % 2 === 0 ? "sm:pr-8 sm:text-right" : "sm:pl-8"}`}>
                      <div className="bg-white dark:bg-gray-800 border border-emerald-50 dark:border-gray-700/50 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 border-l-4 border-l-emerald-600">
                        <div className={`flex items-center gap-2 mb-1.5 ${i % 2 === 0 ? "sm:justify-end" : ""}`}>
                          <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">{milestone.year}</span>
                          <milestone.icon className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed">{milestone.event}</p>
                      </div>
                    </div>
                    <div className="hidden sm:block sm:w-[calc(50%-2rem)]" />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Executive Leadership Section */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-900 border-t border-emerald-50 dark:border-emerald-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal delay={0.1}>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 mb-4">
                <Users className="w-3.5 h-3.5 mr-1.5" />Tim Manajemen
              </Badge>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                Jajaran Direksi & Kepemimpinan
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {managementTeam.map((member, index) => {
              const initials = getInitials(member.name);
              return (
                <ScrollReveal key={member.name} delay={index * 0.05}>
                  <Card className="border-emerald-100 dark:border-emerald-800/50 shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 group overflow-hidden dark:bg-gray-800 h-full flex flex-col justify-between">
                    <div>
                      <div className="h-1 bg-gradient-to-r from-emerald-500 to-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                      <CardContent className="p-6 text-center">
                        <div className="w-24 h-24 rounded-full mx-auto mb-5 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-sm border-2 border-emerald-50">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 to-emerald-900" />
                          <span className="relative text-2xl font-bold text-white tracking-wider drop-shadow-sm">{initials}</span>
                        </div>
                        <h4 className="font-extrabold text-gray-900 dark:text-white text-base leading-tight">{member.name}</h4>
                        <p className="text-amber-600 dark:text-amber-500 font-semibold text-xs mt-2 uppercase tracking-wide">{member.position}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-4 leading-relaxed font-medium">{member.desc}</p>
                      </CardContent>
                    </div>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />
    </div>
  );
}
