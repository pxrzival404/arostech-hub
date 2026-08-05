"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  LogOut,
  ArrowRight,
  DollarSign,
  Truck,
  Inbox,
  Menu,
  PenLine,
  Package,
  MessageSquare,
} from "lucide-react";
import { useSpoke } from "@/components/SpokeProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const sidebarNavItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Kotak Masuk",
    href: "/admin/inbox",
    icon: Inbox,
  },
  {
    title: "Manajemen RFQ",
    href: "/admin/rfqs",
    icon: FileText,
  },
  {
    title: "Manajemen Harga",
    href: "/admin/pricing",
    icon: DollarSign,
  },
  {
    title: "Ongkos Kirim",
    href: "/admin/shipping",
    icon: Truck,
  },
  {
    title: "Moderasi Komentar",
    href: "/admin/comments",
    icon: MessageSquare,
  },
  {
    title: "Kelola Produk",
    href: "/studio",
    icon: Package,
    external: true,
  },
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { brandName, subdomain: currentSubdomain, isPreviewDomain, getSpokeUrl } = useSpoke();

  return (
    <div className="flex h-full flex-col">
      {/* Logo / Brand */}
      <div className="flex h-14 items-center border-b border-zinc-200 px-5 dark:border-zinc-800">
        <Link href={getSpokeUrl("/admin")} className="flex items-center gap-2.5" onClick={onNavClick}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Arostech
            </span>
            <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
              Admin Panel
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {sidebarNavItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          // External links (like Studio) open differently
          if (item.external) {
            const studioHref = isPreviewDomain
              ? `${item.href}?subdomain=${currentSubdomain}`
              : item.href;

            return (
              <a
                key={item.href}
                href={studioHref}
                onClick={onNavClick}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </a>
            );
          }

          return (
            <Link
              key={item.href}
              href={getSpokeUrl(item.href)}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border-l-2 border-emerald-600"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <Link
          href={getSpokeUrl("/")}
          onClick={onNavClick}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
        >
          <ArrowRight className="h-4 w-4" />
          Kembali ke Website
        </Link>

        <div className="mt-2 flex items-center justify-between rounded-lg px-3 py-2">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
              {session?.user?.name || "Admin"}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate max-w-[140px]">
              {session?.user?.email || ""}
            </span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-500 hover:text-red-600"
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Logout</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile header bar — visible on < lg */}
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka menu navigasi"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
            A
          </div>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Arostech
          </span>
          <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
            Admin
          </span>
        </Link>
      </div>

      {/* Mobile sidebar as Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigasi Admin</SheetTitle>
          </SheetHeader>
          <SidebarContent onNavClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar — hidden on < lg */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:block">
        <SidebarContent />
      </aside>
    </TooltipProvider>
  );
}
