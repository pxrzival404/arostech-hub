"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Eye, Target, Award, TrendingUp, Lightbulb,
  Handshake, Calendar, MapPin, CheckCircle2, Rocket,
  Shield, Leaf, Factory, Heart, Flag, type LucideIcon,
} from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { useCounter } from "@/hooks/use-counter";

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

const misiIcons: LucideIcon[] = [Shield, Leaf, Handshake, Factory, Heart, Flag];

const visiMisiItems = [
  {
    icon: Eye, title: "Visi",
    content: "Menjadi penyedia solusi energi dan infrastruktur terdepan di Indonesia yang berkomitmen pada kualitas, keberlanjutan, dan inovasi teknologi untuk kemajuan bangsa.",
    items: null,
  },
  {
    icon: Target, title: "Misi", content: null,
    items: [
      "Menyediakan produk dan layanan berkualitas tinggi yang memenuhi standar SNI dan internasional",
      "Mengembangkan teknologi energi terbarukan yang ramah lingkungan dan berkelanjutan",
      "Membangun kemitraan jangka panjang dengan pemerintah dan sektor swasta",
      "Meningkatkan TKDN (Tingkat Komponen Dalam Negeri) dalam setiap produk",
      "Memberikan pelayanan terbaik dan solusi yang tepat bagi kebutuhan pelanggan",
      "Berkontribusi pada pembangunan infrastruktur Indonesia yang merata",
    ],
  },
];

function CompanyStatCounter({ value, suffix, icon: Icon, label }: { value: number; suffix: string; icon: typeof Calendar; label: string }) {
  const count = useCounter(value, 2500, true);
  return (
    <div className="flex flex-col items-center text-center gap-2 p-5 rounded-xl bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-800/50 shadow-sm hover-lift group">
      <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/50 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-800 transition-colors">
        <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-100">{count}{suffix}</div>
      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-tight">{label}</div>
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.replace(/^(Ir\.|Hj\.|Dr\.)\s*/, "").split(" ");
  const first = parts[0]?.charAt(0) || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) || "" : "";
  return (first + last).toUpperCase();
}

function AboutHeroIllustration() {
  return (
    <svg viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full h-full">
      <defs>
        <linearGradient id="about-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FBFAF7" />
        </linearGradient>
        <linearGradient id="about-panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="about-factory" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="100%" stopColor="#065F46" />
        </linearGradient>
      </defs>
      {/* Sky background */}
      <rect width="400" height="200" fill="url(#about-sky)" />
      {/* Sun */}
      <g transform="translate(330 50)">
        <circle cx="0" cy="0" r="18" fill="#FBBF24" />
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * Math.PI) / 6;
          return (
            <line
              key={i}
              x1={(Math.cos(angle) * 24).toFixed(4)}
              y1={(Math.sin(angle) * 24).toFixed(4)}
              x2={(Math.cos(angle) * 32).toFixed(4)}
              y2={(Math.sin(angle) * 32).toFixed(4)}
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          );
        })}
      </g>
      {/* Factory silhouette (back) */}
      <g transform="translate(20 100)">
        <path d="M 0 100 L 0 50 L 12 50 L 12 35 L 25 35 L 25 50 L 45 35 L 45 50 L 65 35 L 65 50 L 78 50 L 78 100 Z" fill="url(#about-factory)" opacity="0.5" />
        <rect x="80" y="35" width="10" height="65" fill="#065F46" opacity="0.6" />
        <circle cx="85" cy="28" r="6" fill="#D1FAE5" opacity="0.6" />
        <circle cx="92" cy="20" r="5" fill="#D1FAE5" opacity="0.4" />
      </g>
      {/* Ground */}
      <rect x="0" y="200" width="400" height="80" fill="#FBFAF7" />
      <line x1="0" y1="200" x2="400" y2="200" stroke="#047857" strokeWidth="1" opacity="0.3" />
      {/* Solar panel array (foreground, angled) */}
      <g transform="translate(80 145) rotate(-15 120 50)">
        {/* Panel 1 */}
        <g>
          <rect x="0" y="0" width="100" height="60" fill="url(#about-panel)" stroke="#065F46" strokeWidth="2" rx="2" />
          <line x1="0" y1="20" x2="100" y2="20" stroke="#ECFDF5" strokeWidth="1" opacity="0.5" />
          <line x1="0" y1="40" x2="100" y2="40" stroke="#ECFDF5" strokeWidth="1" opacity="0.5" />
          <line x1="25" y1="0" x2="25" y2="60" stroke="#ECFDF5" strokeWidth="1" opacity="0.5" />
          <line x1="50" y1="0" x2="50" y2="60" stroke="#ECFDF5" strokeWidth="1" opacity="0.5" />
          <line x1="75" y1="0" x2="75" y2="60" stroke="#ECFDF5" strokeWidth="1" opacity="0.5" />
        </g>
        {/* Panel 2 */}
        <g transform="translate(115 5)">
          <rect x="0" y="0" width="100" height="60" fill="url(#about-panel)" stroke="#065F46" strokeWidth="2" rx="2" />
          <line x1="0" y1="20" x2="100" y2="20" stroke="#ECFDF5" strokeWidth="1" opacity="0.5" />
          <line x1="0" y1="40" x2="100" y2="40" stroke="#ECFDF5" strokeWidth="1" opacity="0.5" />
          <line x1="25" y1="0" x2="25" y2="60" stroke="#ECFDF5" strokeWidth="1" opacity="0.5" />
          <line x1="50" y1="0" x2="50" y2="60" stroke="#ECFDF5" strokeWidth="1" opacity="0.5" />
          <line x1="75" y1="0" x2="75" y2="60" stroke="#ECFDF5" strokeWidth="1" opacity="0.5" />
        </g>
        {/* Support poles */}
        <line x1="50" y1="60" x2="50" y2="80" stroke="#065F46" strokeWidth="2" />
        <line x1="165" y1="65" x2="165" y2="85" stroke="#065F46" strokeWidth="2" />
      </g>
      {/* Small PJU pole accent on the right */}
      <g transform="translate(345 145)">
        <line x1="0" y1="0" x2="0" y2="55" stroke="#047857" strokeWidth="2" />
        <path d="M 0 5 L -18 0 L -18 -3 L 0 2" fill="#047857" />
        <rect x="-22" y="-3" width="8" height="3" fill="#FBBF24" rx="1" />
      </g>
    </svg>
  );
}

export default function AboutSection() {
  return (
    <section id="tentang-kami" className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, #047857 1px, transparent 1px)`, backgroundSize: '24px 24px', opacity: 0.02 }} />
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal delay={0}>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 mb-4">
              <Building2 className="w-3.5 h-3.5 mr-1.5" />Tentang Kami
            </Badge>
            <h2 className="section-heading">Mengenal PT. Daya Berkah Sentosa Nusantara (DBSN)</h2>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
              Mitra terpercaya dalam solusi energi dan infrastruktur untuk Indonesia
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {companyStats.map((stat) => <CompanyStatCounter key={stat.label} {...stat} />)}
          </div>
        </ScrollReveal>

        <Tabs defaultValue="profil" className="w-full">
          <ScrollReveal delay={0.1}>
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-transparent p-0 h-auto border-b border-gray-200 dark:border-gray-700">
              {[{ value: "profil", label: "Profil Perusahaan" }, { value: "visi-misi", label: "Visi & Misi" }, { value: "tim", label: "Tim Manajemen" }].map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}
                  className="data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-700 data-[state=active]:font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dark:data-[state=active]:text-emerald-400 border-b-2 border-transparent min-h-[44px] rounded-none text-sm font-medium transition-all duration-200">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <TabsContent value="profil">
              <div className="space-y-8">
                <Card className="border-emerald-100 dark:border-emerald-800/50 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden dark:bg-gray-800">
                  <div className="h-1 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500" />
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-2 gap-0">
                      {/* Left: editorial illustration */}
                      <div className="relative bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-emerald-950/40 dark:via-gray-900 dark:to-amber-950/30 min-h-[280px] flex items-center justify-center p-8 border-r border-emerald-100 dark:border-emerald-800/50">
                        <AboutHeroIllustration />
                      </div>
                      {/* Right: condensed copy + 4 highlight cards in 2×2 */}
                      <div className="p-6 md:p-8 space-y-6">
                        <div className="space-y-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                            <Building2 className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Profil Perusahaan</span>
                          </div>
                          <h3 className="text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-100">PT. Daya Berkah Sentosa Nusantara (DBSN)</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            Berdiri sejak 2009, kami menjadi penyedia solusi energi dan infrastruktur terpercaya untuk pemerintah, BUMN, dan swasta di seluruh Indonesia — dengan PJU, Panel Surya, Penangkal Petir, dan Baterai bersertifikasi SNI, TKDN, LKPP, dan ISO.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { icon: Award, title: "Sertifikasi Lengkap", desc: "SNI, TKDN, LKPP, ISO" },
                            { icon: TrendingUp, title: "500+ Proyek", desc: "Di seluruh Indonesia" },
                            { icon: Lightbulb, title: "Energi Terbarukan", desc: "Solusi ramah lingkungan" },
                            { icon: Handshake, title: "Kemitraan Kuat", desc: "Pemerintah & Swasta" },
                          ].map((item) => (
                            <div key={item.title} className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-900/30 dark:to-gray-800 border border-emerald-100 dark:border-emerald-800/50 hover:border-emerald-200 hover:shadow-md transition-all duration-300 group">
                              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center mb-2 group-hover:bg-emerald-200 transition-colors">
                                <item.icon className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 text-xs sm:text-sm">{item.title}</h4>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <ScrollReveal delay={0.3}>
                  <div className="mt-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-6 text-center">Perjalanan Kami</h3>
                    <div className="relative">
                      <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500 via-amber-400 to-emerald-300 sm:-translate-x-px" />
                      <div className="space-y-6 sm:space-y-8">
                        {companyMilestones.map((milestone, i) => (
                          <div key={milestone.year} className={`relative flex items-start gap-4 sm:gap-0 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}>
                            <div className="absolute left-4 sm:left-1/2 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900 shadow-sm -translate-x-1.5 sm:-translate-x-1.5 mt-1.5 z-10" />
                            <div className={`ml-10 sm:ml-0 sm:w-[calc(50%-2rem)] ${i % 2 === 0 ? "sm:pr-8 sm:text-right" : "sm:pl-8"}`}>
                              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-emerald-200 hover:scale-[1.02] transition-all duration-300 border-l-2 border-l-emerald-500">
                                <div className={`flex items-center gap-2 mb-1 ${i % 2 === 0 ? "sm:justify-end" : ""}`}>
                                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{milestone.year}</span>
                                  <milestone.icon className="w-3.5 h-3.5 text-amber-500" />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{milestone.event}</p>
                              </div>
                            </div>
                            <div className="hidden sm:block sm:w-[calc(50%-2rem)]" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </TabsContent>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <TabsContent value="visi-misi">
              <Card className="border-emerald-100 dark:border-emerald-800/50 shadow-sm overflow-hidden dark:bg-gray-800">
                <div className="h-1 bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-600" />
                <CardContent className="p-6 md:p-10 space-y-8">
                  {visiMisiItems.map((item) => (
                    <div key={item.title}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-emerald-700" />
                        </div>
                        <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">{item.title}</h3>
                      </div>
                      {item.content && <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed ml-[52px]">{item.content}</p>}
                      {item.items && (
                        <div className="grid sm:grid-cols-2 gap-3 ml-0 sm:ml-[52px] mt-2">
                          {item.items.map((mission, i) => {
                            const MisiIcon = misiIcons[i % misiIcons.length];
                            return (
                              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 hover:border-emerald-200 hover:shadow-sm transition-all duration-300">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center shrink-0">
                                  <MisiIcon className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{mission}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <TabsContent value="tim">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {managementTeam.map((member) => {
                  const initials = getInitials(member.name);
                  return (
                    <Card key={member.name} className="border-emerald-100 dark:border-emerald-800/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group overflow-hidden dark:bg-gray-800">
                      <div className="h-0.5 bg-gradient-to-r from-emerald-500 to-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                      <CardContent className="p-6 text-center">
                        <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-800" />
                          <span className="relative text-2xl font-bold text-white tracking-wide drop-shadow-sm">{initials}</span>
                        </div>
                        <h4 className="font-bold text-emerald-900 dark:text-emerald-100 text-sm leading-tight">{member.name}</h4>
                        <p className="text-amber-600 font-medium text-sm mt-1.5">{member.position}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-3 leading-relaxed">{member.desc}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </ScrollReveal>
        </Tabs>
      </div>
    </section>
  );
}
