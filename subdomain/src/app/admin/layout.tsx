import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SpokeProvider } from "@/components/SpokeProvider";

export const metadata = {
  title: "Admin Dashboard — Arostech",
  description: "Panel administrasi Arostech",
  robots: "noindex, nofollow",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Double-check server-side (middleware already protects, but defense-in-depth)
  if (!session || (session.user as { role?: string }).role !== "admin") {
    redirect("/auth/login?callbackUrl=/admin");
  }

  return (
    <SpokeProvider>
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
        <AdminSidebar />
        <main className="lg:pl-64">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </SpokeProvider>
  );
}
