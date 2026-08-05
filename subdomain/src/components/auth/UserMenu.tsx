"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon, LogOut, LayoutDashboard, Loader2 } from "lucide-react";

export function UserMenu() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (status === "loading") {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="size-4 animate-spin" />
      </Button>
    );
  }

  if (!session) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/auth/login")}
        className="gap-1.5"
      >
        <UserIcon className="size-4" />
        <span className="hidden sm:inline">Login</span>
      </Button>
    );
  }

  const userName = session.user?.name || session.user?.email || "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 max-w-[200px]">
          <div className="size-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:inline truncate">{userName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-foreground truncate">
            {userName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {session.user?.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            const role = (session.user as { role?: string })?.role;
            router.push(role === "admin" ? "/admin" : "/dashboard");
          }}
          className="cursor-pointer"
        >
          <LayoutDashboard className="size-4 mr-2" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            setIsSigningOut(true);
            await signOut({ redirect: false });
            router.push("/");
            router.refresh();
          }}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="size-4 mr-2" />
          {isSigningOut ? "Keluar..." : "Keluar"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
