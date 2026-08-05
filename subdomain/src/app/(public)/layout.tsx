import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SpokeProvider } from "@/components/SpokeProvider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SpokeProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </SpokeProvider>
  );
}
