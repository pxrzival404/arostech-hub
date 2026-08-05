"use client";

import Link from "next/link";
import { Building2, Award, Phone, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ScrollReveal from "@/components/shared/ScrollReveal";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface SubpageHeroProps {
  title: string;
  subtitle?: string;
  badgeLabel: string;
  badgeIconName: "building" | "award" | "phone";
  breadcrumbs?: BreadcrumbItem[];
}

const iconMap: Record<string, LucideIcon> = {
  building: Building2,
  award: Award,
  phone: Phone,
};

export default function SubpageHero({
  title,
  subtitle,
  badgeLabel,
  badgeIconName,
  breadcrumbs,
}: SubpageHeroProps) {
  const BadgeIcon = iconMap[badgeIconName] || Building2;

  // Default breadcrumbs if not provided
  const defaultBreadcrumbs: BreadcrumbItem[] = breadcrumbs || [
    { label: "Beranda", href: "/" },
    { label: badgeLabel },
  ];

  return (
    <section className="relative pt-32 pb-16 bg-gradient-to-b from-emerald-50/50 dark:from-emerald-950/10 to-background dark:to-background overflow-hidden border-b border-border/40">
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, rgba(5,150,105,0.015) 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal delay={0}>
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
            
            {/* Eyebrow Badge */}
            <Badge variant="outline" className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-3 py-1 font-semibold flex items-center gap-1.5 shadow-sm">
              <BadgeIcon className="w-3.5 h-3.5" />
              {badgeLabel}
            </Badge>

            {/* H1 Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-emerald-950 dark:text-white leading-tight">
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}

            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="pt-2">
              <ol className="flex flex-wrap justify-center items-center gap-2 text-xs font-medium text-muted-foreground">
                {defaultBreadcrumbs.map((crumb, idx) => {
                  const isLast = idx === defaultBreadcrumbs.length - 1;
                  return (
                    <li key={crumb.label} className="flex items-center gap-2">
                      {idx > 0 && <span className="text-gray-300 dark:text-gray-700" aria-hidden="true">/</span>}
                      {crumb.href && !isLast ? (
                        <Link
                          href={crumb.href}
                          className="hover:text-emerald-600 transition-colors"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="text-emerald-800 dark:text-emerald-400 font-semibold" aria-current="page">
                          {crumb.label}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>

          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
