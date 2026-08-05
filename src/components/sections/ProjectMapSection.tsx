"use client";

import { MapPin, Navigation, Clock, Phone } from "lucide-react";

const OFFICE_INFO = {
  name: "PT. Daya Berkah Sentosa Nusantara",
  address: "Jl. Raya Industri No. 88, Surabaya, Jawa Timur 60175",
  lat: -7.3779808,
  lng: 112.6265488,
  phone: "+62 31 1234 5678",
  hours: "Senin – Jumat: 08.00 – 17.00 WIB",
} as const;

const EMBED_URL =
  `https://maps.google.com/maps?q=${OFFICE_INFO.lat},${OFFICE_INFO.lng}&z=18&output=embed`;

const GMAPS_LINK =
  `https://www.google.com/maps/place/PT.+Daya+Berkah+Sentosa+Nusantara/@${OFFICE_INFO.lat},${OFFICE_INFO.lng},18z`;

const infoCards = [
  {
    icon: MapPin,
    label: "Alamat Kantor",
    value: OFFICE_INFO.address,
    colorClass: "text-emerald-600",
    bgClass: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    icon: Clock,
    label: "Jam Operasional",
    value: OFFICE_INFO.hours,
    colorClass: "text-blue-600",
    bgClass: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: Phone,
    label: "Telepon",
    value: OFFICE_INFO.phone,
    colorClass: "text-amber-600",
    bgClass: "bg-amber-50 dark:bg-amber-900/20",
  },
] as const;

export default function ProjectMapSection() {
  return (
    <section
      id="lokasi-kami"
      aria-labelledby="map-section-heading"
      className="py-20 bg-white dark:bg-gray-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 mb-4">
            <MapPin className="w-3.5 h-3.5" />
            Lokasi Kami
          </span>
          <h2
            id="map-section-heading"
            className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight"
          >
            Temukan Kantor Kami
          </h2>
          <p className="mt-3 text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Kunjungi kami langsung atau hubungi tim kami untuk konsultasi solusi
            energi terbarukan terbaik untuk kebutuhan Anda.
          </p>
        </div>

        {/* Two-column layout: Map + Info Cards */}
        <div className="grid lg:grid-cols-5 gap-8 items-stretch">
          {/* Google Maps Embed */}
          <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md min-h-[380px]">
            <iframe
              title="Lokasi Kantor PT. Daya Berkah Sentosa Nusantara"
              src={EMBED_URL}
              width="100%"
              height="100%"
              style={{ minHeight: "380px", border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-2 flex flex-col gap-4 justify-between">
            {/* Office name */}
            <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <span className="font-extrabold text-sm text-white">DB</span>
                </div>
                <div>
                  <p className="font-bold text-base leading-tight">
                    DBSN Dayaberkah.id
                  </p>
                  <p className="text-xs text-emerald-200">
                    PT. Daya Berkah Sentosa Nusantara
                  </p>
                </div>
              </div>
              <p className="text-emerald-100 text-sm leading-relaxed">
                Mitra terpercaya infrastruktur energi terbarukan Indonesia sejak
                2009. Bersertifikasi SNI, TKDN, dan LKPP.
              </p>
            </div>

            {/* Info cards */}
            <div className="flex flex-col gap-3">
              {infoCards.map(({ icon: Icon, label, value, colorClass, bgClass }) => (
                <div
                  key={label}
                  className={`flex items-start gap-4 p-4 rounded-xl ${bgClass} transition-all duration-200`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 shadow-sm`}
                  >
                    <Icon className={`w-4 h-4 ${colorClass}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-0.5 leading-snug">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Open in Maps CTA */}
            <a
              href={GMAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              id="open-in-google-maps"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-sm font-semibold shadow-md transition-all duration-200"
            >
              <Navigation className="w-4 h-4" />
              Buka di Google Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
