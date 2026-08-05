"use client";

import { SpokeLink as Link } from "@/components/SpokeLink";
import { Project } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  Target,
  ListChecks,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface ProjectDetailClientProps {
  project: Project;
}

export function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  return (
    <div className="pt-20">
      {/* Breadcrumb */}
      <section className="bg-muted/30 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Portofolio
          </Link>
        </div>
      </section>

      {/* Hero */}
      <section className="py-12 lg:py-16 bg-gradient-to-b from-emerald-50 to-background dark:from-emerald-950/30 dark:to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800">
                {project.productCategory}
              </Badge>
              <Badge variant="outline">Skala {project.projectScale}</Badge>
              {project.isHighlight && (
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 hover:bg-amber-200">
                  Proyek Highlight
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl leading-tight mb-6">
              {project.title}
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {project.description}
            </p>

            {/* Cover image (dari Sanity) — tampilkan jika ada */}
            {project.coverImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8 aspect-video rounded-xl overflow-hidden border bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 relative"
              >
                <Image
                  src={project.coverImage}
                  alt={project.title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Project Info Grid */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Project details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Scope of Work */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <ListChecks className="size-5 text-emerald-600 dark:text-emerald-400" />
                    Lingkup Pekerjaan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {project.scope.map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="size-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {i + 1}
                          </span>
                        </div>
                        <span className="text-muted-foreground leading-relaxed">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Results */}
              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Target className="size-5 text-emerald-600 dark:text-emerald-400" />
                    Hasil & Dampak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.results.map((result, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30"
                      >
                        <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground leading-relaxed">
                          {result}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {project.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="capitalize border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                  >
                    {tag.replace(/-/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Right: Project meta */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Proyek</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Building2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Klien</p>
                        <p className="text-sm font-medium text-foreground">
                          {project.client}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Lokasi</p>
                        <p className="text-sm font-medium text-foreground">
                          {project.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Tahun</p>
                        <p className="text-sm font-medium text-foreground">{project.year}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Durasi</p>
                        <p className="text-sm font-medium text-foreground">
                          {project.duration}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
                <CardHeader>
                  <CardTitle className="text-lg">Tertarik Proyek Serupa?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Konsultasikan kebutuhan proyek Anda dengan tim ahli kami. Dapatkan
                    penawaran terbaik untuk kebutuhan PJU.
                  </p>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    asChild
                  >
                    <Link href="/rfq">
                      <Send className="size-4" />
                      Ajukan Penawaran
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
