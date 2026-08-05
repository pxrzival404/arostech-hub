"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { SpokeLink as Link } from "@/components/SpokeLink";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { navigationItems } from "@/config/site";
import { cn } from "@/lib/utils";
import { useRFQStore } from "@/lib/rfq-store";
import { UserMenu } from "@/components/auth/UserMenu";
import { useSpoke } from "@/components/SpokeProvider";

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const { subdomain, badgeLabel } = useSpoke();
  const totalItems = useRFQStore((s) =>
    s.folders
      .filter((f) => (f.subdomain || "pju") === subdomain)
      .reduce((t, f) => t + f.items.length, 0)
  );

  // Only landing page has a green hero background behind the header.
  // On all other pages, the header should always look "scrolled" (solid bg + dark text)
  // so the text is visible against the white/light page background.
  const isHomePage = pathname === "/";
  const useTransparentStyle = isHomePage && !scrolled;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        useTransparentStyle
          ? "bg-transparent"
          : "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm border-b border-border"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center gap-2.5">
              <Image
                src="/images/logo-arostech.webp"
                alt="Arostech Logo"
                width={32}
                height={32}
                className="shrink-0"
              />
              <span
                className={cn(
                  "text-xl font-bold transition-colors",
                  useTransparentStyle
                    ? "text-white dark:text-emerald-400 group-hover:text-emerald-100 dark:group-hover:text-emerald-300"
                    : "text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300"
                )}
              >
                Arostech
              </span>
              <span
                className={cn(
                  "ml-1.5 inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold text-white transition-colors",
                  useTransparentStyle
                    ? "bg-white/20 dark:bg-emerald-500"
                    : "bg-emerald-600 dark:bg-emerald-500"
                )}
              >
                {badgeLabel}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  pathname === item.href
                    ? useTransparentStyle
                      ? "text-white dark:text-emerald-400 bg-white/15 dark:bg-emerald-950/50"
                      : "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50"
                    : useTransparentStyle
                      ? "text-white/80 dark:text-gray-300 hover:text-white dark:hover:text-emerald-400 hover:bg-white/10 dark:hover:bg-gray-800"
                      : "text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side: RFQ + Theme toggle + Mobile menu */}
          <div className="flex items-center gap-2">
            {/* Draft RFQ Button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "relative transition-colors",
                useTransparentStyle
                  ? "text-white/80 dark:text-gray-300"
                  : "text-gray-700 dark:text-gray-300"
              )}
              asChild
            >
              <Link href="/draft-rfq" aria-label="Draft RFQ">
                <FolderOpen className="size-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center size-5 rounded-full bg-emerald-600 dark:bg-emerald-500 text-[10px] font-bold text-white">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Link>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={cn(
                "transition-colors",
                useTransparentStyle
                  ? "text-white/80 dark:text-gray-300"
                  : "text-gray-700 dark:text-gray-300"
              )}
              aria-label="Toggle theme"
            >
              {mounted && theme === "dark" ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )}
            </Button>

            {/* User Menu */}
            <UserMenu />

            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "md:hidden transition-colors",
                    useTransparentStyle
                      ? "text-white/80 dark:text-gray-300"
                      : "text-gray-700 dark:text-gray-300"
                  )}
                  aria-label="Menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
                <div className="flex items-center gap-2 mb-6 mt-4">
                  <Image
                    src="/images/logo-arostech.webp"
                    alt="Arostech Logo"
                    width={32}
                    height={32}
                    className="shrink-0"
                  />
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Arostech</span>
                  <span className="inline-flex items-center rounded-md bg-emerald-600 px-1.5 py-0.5 text-xs font-semibold text-white">{badgeLabel}</span>
                </div>
                <div className="flex flex-col gap-1">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "px-4 py-3 text-sm font-medium rounded-md transition-colors",
                        pathname === item.href
                          ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50"
                          : "text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}

                  {/* Draft RFQ in mobile menu */}
                  <Link
                    href="/draft-rfq"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "px-4 py-3 text-sm font-medium rounded-md transition-colors flex items-center gap-2",
                      pathname === "/draft-rfq"
                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50"
                        : "text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <FolderOpen className="size-4" />
                    Draft RFQ
                    {totalItems > 0 && (
                      <span className="ml-auto inline-flex items-center justify-center size-5 rounded-full bg-emerald-600 dark:bg-emerald-500 text-[10px] font-bold text-white">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
