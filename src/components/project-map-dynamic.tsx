"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="relative rounded-2xl overflow-hidden border border-border dark:border-gray-800 shadow-sm">
      <div className="w-full bg-slate-50 dark:bg-gray-900 flex items-center justify-center" style={{ height: "420px" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-200 border-t-emerald-600 animate-spin" />
          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Memuat peta interaktif...</span>
        </div>
      </div>
    </div>
  ),
});

export default function ProjectMapDynamic() {
  return <LeafletMap />;
}
