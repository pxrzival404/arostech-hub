"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Users,
  Clock,
  CheckCircle2,
  Send,
  Loader2,
  TrendingUp,
  AlertCircle,
  Mail,
  Shield,
  BarChart3,
} from "lucide-react";
import { SpokeLink as Link } from "@/components/SpokeLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSpoke } from "@/components/SpokeProvider";
import { SubdomainFilter } from "@/components/admin/SubdomainFilter";

interface DashboardStats {
  totalRfqs: number;
  draftRfqs: number;
  submittedRfqs: number;
  processingRfqs: number;
  quotedRfqs: number;
  acceptedRfqs: number;
  rejectedRfqs: number;
  totalClients: number;
  unreadMessages: number;
}

interface RecentRFQ {
  id: string;
  folderName: string;
  status: string;
  createdAt: string;
  submittedAt: string | null;
  client: {
    name: string;
    email: string;
    company: string | null;
  };
}

export function AdminOverviewClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const { brandName, subdomain, isPreviewDomain } = useSpoke();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRfqs, setRecentRfqs] = useState<RecentRFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Build API URL with subdomain param for preview domains
  const buildApiUrl = (path: string) => {
    if (!isPreviewDomain) return path;
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}subdomain=${subdomain}`;
  };

  // M11: Auto-refresh stats setiap 30 detik
  const fetchStats = async () => {
    try {
      const res = await fetch(buildApiUrl("/api/admin/dashboard"));
      if (!res.ok) throw new Error("Gagal memuat data");
      const data = await res.json();
      setStats(data.stats);
      setRecentRfqs(data.recentRfqs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // M11: Polling setiap 30 detik
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [subdomain]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        <span className="ml-3 text-slate-500">
          Memuat dashboard...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-3 text-red-600">{error}</span>
      </div>
    );
  }

  const statusToBadge: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    DRAFT: { label: "Draft", variant: "outline" },
    SUBMITTED: { label: "Submitted", variant: "secondary" },
    PROCESSING: { label: "Processing", variant: "default" },
    QUOTED: { label: "Quoted", variant: "default" },
    ACCEPTED: { label: "Accepted", variant: "default" },
    REJECTED: { label: "Rejected", variant: "destructive" },
  };

  return (
    <div className="space-y-8">
      {/* Admin Header Bar */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-white shadow-lg dark:from-slate-900 dark:to-slate-800 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur">
            <Shield className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="mt-0.5 text-sm text-slate-300">
              Selamat datang, {session?.user?.name || "Admin"}. Berikut ringkasan
              data RFQ {brandName}.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <SubdomainFilter />

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard
            title="Total RFQ"
            value={stats.totalRfqs}
            icon={FileText}
            color="slate"
            href="/admin/rfqs"
          />
          <StatCard
            title="Menunggu Diproses"
            value={stats.submittedRfqs + stats.processingRfqs}
            icon={Clock}
            color="amber"
            subtitle={`${stats.submittedRfqs} submitted, ${stats.processingRfqs} processing`}
            href="/admin/rfqs?status=SUBMITTED"
          />
          <StatCard
            title="Sudah Dikutip"
            value={stats.quotedRfqs}
            icon={CheckCircle2}
            color="emerald"
            href="/admin/rfqs?status=QUOTED"
          />
          <StatCard
            title="Total Klien"
            value={stats.totalClients}
            icon={Users}
            color="slate"
            href="/admin/rfqs"
          />
          <StatCard
            title="Pesan Belum Dibaca"
            value={stats.unreadMessages}
            icon={Mail}
            color="amber"
            subtitle="Kotak Masuk"
            href="/admin/inbox?status=UNREAD"
          />
        </div>
      )}

      {/* Status Breakdown */}
      {stats && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Breakdown Status
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
            <MiniStat label="Draft" value={stats.draftRfqs} status="DRAFT" variant="outline" />
            <MiniStat label="Submitted" value={stats.submittedRfqs} status="SUBMITTED" variant="secondary" />
            <MiniStat label="Processing" value={stats.processingRfqs} status="PROCESSING" variant="default" />
            <MiniStat label="Quoted" value={stats.quotedRfqs} status="QUOTED" variant="default" />
            <MiniStat label="Accepted" value={stats.acceptedRfqs} status="ACCEPTED" variant="default" />
            <MiniStat label="Rejected" value={stats.rejectedRfqs} status="REJECTED" variant="destructive" />
          </div>
        </div>
      )}

      {/* Recent RFQs */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            RFQ Terbaru
          </h2>
          <Link href="/admin/rfqs">
            <Button variant="outline" size="sm">
              Lihat Semua
              <TrendingUp className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {recentRfqs.length === 0 ? (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="py-8 text-center text-slate-500">
                Belum ada RFQ
              </CardContent>
            </Card>
          ) : (
            recentRfqs.map((rfq) => (
              <Link key={rfq.id} href={`/admin/rfqs?id=${rfq.id}`}>
                <Card className="mb-2 transition-all hover:border-emerald-300 hover:shadow-md dark:hover:border-emerald-700 cursor-pointer">
                  <CardContent className="flex items-center justify-between py-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {rfq.folderName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {rfq.client.name} • {rfq.client.company || rfq.client.email}
                      </p>
                    </div>
                    <Badge
                      variant={
                        statusToBadge[rfq.status]?.variant || "outline"
                      }
                      className="ml-3"
                    >
                      {statusToBadge[rfq.status]?.label || rfq.status}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  href,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "emerald" | "amber" | "slate";
  subtitle?: string;
  href: string;
}) {
  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };

  const borderColor = {
    emerald: "hover:border-emerald-300 dark:hover:border-emerald-700",
    amber: "hover:border-amber-300 dark:hover:border-amber-700",
    slate: "hover:border-slate-400 dark:hover:border-slate-600",
  };

  return (
    <Link href={href} className="contents">
      <Card
        className={cn(
          "transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-md",
          borderColor[color]
        )}
      >
        <CardContent className="px-3 py-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {title}
            </p>
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-md",
                colorClasses[color]
              )}
            >
              <Icon className="h-3 w-3" />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
              {subtitle}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function MiniStat({
  label,
  value,
  status,
  variant,
}: {
  label: string;
  value: number;
  status: string;
  variant: "default" | "secondary" | "destructive" | "outline";
}) {
  return (
    <Link href={`/admin/rfqs?status=${status}`} className="contents">
      <Card className="transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-sm hover:border-slate-400 dark:hover:border-slate-600">
        <CardContent className="flex items-center justify-between p-4">
          <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
          <Badge variant={variant}>{value}</Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
