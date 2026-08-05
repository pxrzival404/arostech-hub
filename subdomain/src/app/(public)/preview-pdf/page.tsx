import { promises as fs } from "node:fs";
import path from "node:path";
import { SpokeLink as Link } from "@/components/SpokeLink";

interface PdfFile {
  name: string;
  url: string;
  size: number;
  type: "raw" | "processed" | "unknown";
  createdAt: Date;
}

async function listPdfs(): Promise<PdfFile[]> {
  const dir = path.join(process.cwd(), "public", "rfq-pdfs");
  try {
    const entries = await fs.readdir(dir);
    const pdfs: PdfFile[] = [];

    for (const name of entries) {
      if (!name.endsWith(".pdf")) continue;
      const fullPath = path.join(dir, name);
      const stat = await fs.stat(fullPath);

      let type: PdfFile["type"] = "unknown";
      if (name.endsWith("-raw.pdf")) type = "raw";
      else if (name.endsWith("-processed.pdf")) type = "processed";

      pdfs.push({
        name,
        url: `/rfq-pdfs/${name}`,
        size: stat.size,
        type,
        createdAt: stat.birthtime,
      });
    }

    pdfs.sort((a, b) => {
      const typeOrder = { processed: 0, raw: 1, unknown: 2 };
      if (typeOrder[a.type] !== typeOrder[b.type]) {
        return typeOrder[a.type] - typeOrder[b.type];
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return pdfs;
  } catch {
    return [];
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(date: Date): string {
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TYPE_STYLES = {
  raw: {
    label: "Raw RFQ",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    description: "Konfirmasi pengajuan (tanpa pricing) — dikirim segera",
  },
  processed: {
    label: "Processed RFQ",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    description: "Penawaran resmi (dengan pricing) — dikirim 1x24 jam",
  },
  unknown: {
    label: "Unknown",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    description: "File PDF lain",
  },
} as const;

export default async function PreviewPdfPage() {
  const pdfs = await listPdfs();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Preview PDF — RFQ 2-PDF System
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Halaman ini menampilkan semua PDF yang sudah di-generate oleh sistem.
                Klik file untuk membuka di tab baru, atau gunakan inline viewer.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition"
            >
              ← Beranda
            </Link>
          </div>
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full" />
        </div>

        {/* Info Banner */}
        <div className="mb-6 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4">
          <h2 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
            ℹ️ Tentang 2-PDF System
          </h2>
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
            Setiap RFQ menghasilkan 2 PDF: <strong>Raw</strong> (konfirmasi pengajuan, tanpa harga,
            dikirim segera) dan <strong>Processed</strong> (penawaran resmi dengan pricing breakdown,
            dikirim dalam 1x24 jam setelah review tim sales). Formula pricing hanya muncul di Processed PDF.
          </p>
        </div>

        {/* List */}
        {pdfs.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Belum ada PDF yang di-generate.
            </p>
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
              Submit RFQ di halaman <Link href="/rfq" className="text-emerald-600 hover:underline">/rfq</Link> untuk generate PDF.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pdfs.map((pdf) => {
              const style = TYPE_STYLES[pdf.type];
              return (
                <div
                  key={pdf.name}
                  className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.badge}`}
                      >
                        {style.label}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatBytes(pdf.size)}
                      </span>
                    </div>
                    <h3 className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                      {pdf.name}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Dibuat: {formatDate(pdf.createdAt)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {style.description}
                    </p>
                  </div>

                  <div className="p-4 flex flex-wrap gap-2">
                    <a
                      href={pdf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition"
                    >
                      Buka di tab baru ↗
                    </a>
                    <a
                      href={pdf.url}
                      download={pdf.name}
                      className="inline-flex items-center gap-1 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      Download ↓
                    </a>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                    <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                      Inline preview (scroll di dalam frame):
                    </div>
                    <iframe
                      src={pdf.url}
                      title={`Preview ${pdf.name}`}
                      className="w-full h-[400px] bg-white"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-500">
          <p>
            PDF di-generate oleh <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800">src/lib/pdf-generator.ts</code>
            {" "}menggunakan pdfkit + Liberation Sans TTF.
          </p>
          <p className="mt-1">
            Lokasi penyimpanan: <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800">/public/rfq-pdfs/</code>
          </p>
        </div>
      </div>
    </div>
  );
}
