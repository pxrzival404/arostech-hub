import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminRfqListClient } from "./AdminRfqListClient";
import { Suspense } from "react";

export const metadata = {
  title: "RFQ Management — Arostech PJU Admin",
};

export default async function AdminRfqsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "admin") {
    redirect("/auth/login?callbackUrl=/admin/rfqs");
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" /></div>}>
      <AdminRfqListClient />
    </Suspense>
  );
}
