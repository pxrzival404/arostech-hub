import type { Product, Article, CompanyInfo, Project } from "@/types";

export const products: Product[] = [
  {
    id: "solarpanel-5wp",
    name: "Solar Panel 5WP",
    slug: "solarpanel-5wp",
    category: "solarpanel",
    subcategory: "solarpanel-kecil",
    description:
      "Solar panel 5 Watt Peak monocrystalline untuk aplikasi skala kecil seperti penerangan taman, sensor otomatis, dan pengisian baterai kecil. Panel ini menggunakan sel monocrystalline dengan efisiensi konversi tinggi dalam bentang fisik yang ringkas. Cocok untuk proyek DIY, penerangan darurat, dan sistem off-grid skala mikro.",
    specifications: [
      { label: "Daya Puncak", value: "5WP" },
      { label: "Tipe Sel", value: "Monocrystalline" },
      { label: "Tegangan Vmp", value: "17.5V" },
      { label: "Arus Imp", value: "0.29A" },
      { label: "Dimensi", value: "250 x 200 x 17 mm" },
      { label: "Berat", value: "0.6 kg" },
    ],
    images: ["/images/products/solarpanel-5wp.jpg"],
    highlights: [
      "Ringkas dan ringan",
      "Cocok untuk penerangan taman",
      "Ideal untuk proyek DIY",
    ],
    isHighlight: true,
    tags: ["solar-panel", "5wp", "monocrystalline", "kecil"],
    specificationMethod: "from-specs",
  },
  {
    id: "solarpanel-20wp",
    name: "Solar Panel 20WP",
    slug: "solarpanel-20wp",
    category: "solarpanel",
    subcategory: "solarpanel-kecil",
    description:
      "Solar panel 20 Watt Peak monocrystalline untuk kebutuhan penerangan rumah tangga, charging gadget, dan sistem sederhana lainnya. Dilengkapi dengan aluminium frame yang kokoh dan kabel PV standar. Panel ini memberikan keseimbangan optimal antara daya output dan kemudahan instalasi untuk penggunaan sehari-hari.",
    specifications: [
      { label: "Daya Puncak", value: "20WP" },
      { label: "Tipe Sel", value: "Monocrystalline" },
      { label: "Tegangan Vmp", value: "18.0V" },
      { label: "Arus Imp", value: "1.11A" },
      { label: "Dimensi", value: "440 x 350 x 25 mm" },
      { label: "Berat", value: "2.0 kg" },
    ],
    images: ["/images/products/solarpanel-20wp.jpg"],
    highlights: [
      "Aluminium frame kokoh",
      "Cocok untuk penerangan rumah",
      "Kabel PV standar included",
    ],
    isHighlight: true,
    tags: ["solar-panel", "20wp", "monocrystalline", "rumah-tangga"],
    specificationMethod: "from-specs",
  },
  {
    id: "solarpanel-50wp",
    name: "Solar Panel 50WP",
    slug: "solarpanel-50wp",
    category: "solarpanel",
    subcategory: "solarpanel-kecil",
    description:
      "Solar panel 50 Watt Peak monocrystalline untuk sistem off-grid menengah seperti penerangan desa, pompa air kecil, dan telekomunikasi remote. Efisiensi sel lebih dari 19% memaksimalkan produksi energi dalam area terbatas. Dilengkapi diode bypass untuk proteksi hotspot dan optimalisasi performa saat shading parsial.",
    specifications: [
      { label: "Daya Puncak", value: "50WP" },
      { label: "Tipe Sel", value: "Monocrystalline" },
      { label: "Tegangan Vmp", value: "18.5V" },
      { label: "Arus Imp", value: "2.70A" },
      { label: "Dimensi", value: "670 x 500 x 30 mm" },
      { label: "Berat", value: "4.2 kg" },
    ],
    images: ["/images/products/solarpanel-50wp.jpg"],
    highlights: [
      "Efisiensi sel >19%",
      "Diode bypass untuk proteksi hotspot",
      "Cocok untuk sistem off-grid desa",
    ],
    isHighlight: true,
    tags: ["solar-panel", "50wp", "monocrystalline", "off-grid"],
    specificationMethod: "from-specs",
  },
  {
    id: "solarpanel-100wp",
    name: "Solar Panel 100WP",
    slug: "solarpanel-100wp",
    category: "solarpanel",
    subcategory: "solarpanel-besar",
    description:
      "Solar panel 100 Watt Peak monocrystalline half-cut cell untuk sistem on-grid dan off-grid skala menengah. Teknologi half-cut cell meningkatkan efisiensi dan mengurangi resistansi internal, menghasilkan output yang lebih stabil pada suhu tinggi. Cocok untuk rumah tangga, kantor kecil, dan pos keamanan.",
    specifications: [
      { label: "Daya Puncak", value: "100WP" },
      { label: "Tipe Sel", value: "Monocrystalline Half-Cut" },
      { label: "Tegangan Vmp", value: "19.2V" },
      { label: "Arus Imp", value: "5.21A" },
      { label: "Dimensi", value: "1030 x 510 x 30 mm" },
      { label: "Berat", value: "6.5 kg" },
    ],
    images: ["/images/products/solarpanel-100wp.jpg"],
    highlights: [
      "Teknologi half-cut cell",
      "Output stabil pada suhu tinggi",
      "Cocok untuk rumah dan kantor",
      "Efisiensi konversi >20%",
    ],
    isHighlight: false,
    tags: ["solar-panel", "100wp", "monocrystalline", "half-cut"],
    specificationMethod: "from-specs",
  },
  {
    id: "solarpanel-200wp",
    name: "Solar Panel 200WP",
    slug: "solarpanel-200wp",
    category: "solarpanel",
    subcategory: "solarpanel-besar",
    description:
      "Solar panel 200 Watt Peak monocrystalline half-cut cell untuk instalasi rooftop on-grid dan off-grid menengah. Konstruksi frame aluminium anodized 40mm yang kokoh tahan terhadap angin dan beban salju. Kaca tempered 3.2mm memberikan proteksi maksimal terhadap hujan es dan benturan.",
    specifications: [
      { label: "Daya Puncak", value: "200WP" },
      { label: "Tipe Sel", value: "Monocrystalline Half-Cut" },
      { label: "Tegangan Vmp", value: "20.4V" },
      { label: "Arus Imp", value: "9.80A" },
      { label: "Dimensi", value: "1320 x 660 x 30 mm" },
      { label: "Berat", value: "11.5 kg" },
    ],
    images: ["/images/products/solarpanel-200wp.jpg"],
    highlights: [
      "Frame aluminium anodized 40mm",
      "Kaca tempered 3.2mm",
      "Cocok untuk rooftop on-grid",
      "Garansi performa 25 tahun",
    ],
    isHighlight: false,
    tags: ["solar-panel", "200wp", "monocrystalline", "rooftop"],
    specificationMethod: "from-specs",
  },
  {
    id: "solarpanel-350wp",
    name: "Solar Panel 350WP",
    slug: "solarpanel-350wp",
    category: "solarpanel",
    subcategory: "solarpanel-besar",
    description:
      "Solar panel 350 Watt Peak monocrystalline PERC untuk instalasi komersial dan industri skala besar. Teknologi PERC (Passivated Emitter and Rear Cell) meningkatkan efisiensi konversi hingga 21.3% dengan menangkap lebih banyak foton pada sisi belakang sel. IP68 junction box memberikan proteksi maksimal untuk koneksi eksternal.",
    specifications: [
      { label: "Daya Puncak", value: "350WP" },
      { label: "Tipe Sel", value: "Monocrystalline PERC" },
      { label: "Tegangan Vmp", value: "33.8V" },
      { label: "Arus Imp", value: "10.36A" },
      { label: "Dimensi", value: "1690 x 996 x 35 mm" },
      { label: "Berat", value: "18.5 kg" },
    ],
    images: ["/images/products/solarpanel-350wp.jpg"],
    highlights: [
      "Teknologi PERC efisiensi 21.3%",
      "IP68 junction box",
      "Ideal untuk komersial dan industri",
      "Garansi performa 25 tahun",
    ],
    isHighlight: false,
    tags: ["solar-panel", "350wp", "perc", "komersial"],
    specificationMethod: "from-specs",
  },
  {
    id: "solarpanel-450wp",
    name: "Solar Panel 450WP",
    slug: "solarpanel-450wp",
    category: "solarpanel",
    subcategory: "solarpanel-besar",
    description:
      "Solar panel 450 Watt Peak monocrystalline PERC half-cut untuk proyek solar farm dan instalasi rooftop besar. Sel M6 (166mm) half-cut memberikan output lebih tinggi dengan losses yang lebih rendah. Desain 144 sel dalam konfigurasi 2×72 mengoptimalkan performa pada kondisi shading parsial dan suhu tinggi.",
    specifications: [
      { label: "Daya Puncak", value: "450WP" },
      { label: "Tipe Sel", value: "Monocrystalline PERC Half-Cut M6" },
      { label: "Tegangan Vmp", value: "41.7V" },
      { label: "Arus Imp", value: "10.79A" },
      { label: "Dimensi", value: "2094 x 1038 x 35 mm" },
      { label: "Berat", value: "23.0 kg" },
    ],
    images: ["/images/products/solarpanel-450wp.jpg"],
    highlights: [
      "Sel M6 half-cut efisiensi tinggi",
      "Performa optimal saat shading parsial",
      "Untuk solar farm dan rooftop besar",
    ],
    isHighlight: false,
    tags: ["solar-panel", "450wp", "perc", "half-cut", "solar-farm"],
    specificationMethod: "from-specs",
  },
  {
    id: "solarpanel-550wp",
    name: "Solar Panel 550WP",
    slug: "solarpanel-550wp",
    category: "solarpanel",
    subcategory: "solarpanel-besar",
    description:
      "Solar panel 550 Watt Peak monocrystalline PERC half-cut dengan sel M10 (182mm) untuk proyek utilitas skala besar dan solar farm. Panel premium ini menghadirkan efisiensi konversi tertinggi di kelasnya dengan teknologi multi-busbar dan gallium-doped wafer. Desain kabel panjang 400mm memudahkan wiring pada mounting system.",
    specifications: [
      { label: "Daya Puncak", value: "550WP" },
      { label: "Tipe Sel", value: "Monocrystalline PERC Half-Cut M10" },
      { label: "Tegangan Vmp", value: "41.65V" },
      { label: "Arus Imp", value: "13.21A" },
      { label: "Dimensi", value: "2278 x 1134 x 35 mm" },
      { label: "Berat", value: "27.5 kg" },
    ],
    images: ["/images/products/solarpanel-550wp.jpg"],
    highlights: [
      "Sel M10 (182mm) efisiensi premium",
      "Multi-busbar & gallium-doped wafer",
      "Untuk proyek utilitas skala besar",
      "Efisiensi konversi >21.5%",
    ],
    isHighlight: false,
    tags: ["solar-panel", "550wp", "m10", "utilitas", "solar-farm"],
    specificationMethod: "from-specs",
  },
];

export const articles: Article[] = [
  {
    id: "panduan-instalasi-solar-panel",
    title: "Panduan Lengkap Instalasi Solar Panel untuk Rumah dan Bisnis",
    slug: "panduan-instalasi-solar-panel",
    category: "solarpanel",
    excerpt:
      "Instalasi solar panel yang tepat sangat menentukan performa dan umur sistem. Pelajari langkah-langkah penting dari survey awal hingga commissioning untuk hasil optimal.",
    content: `
Instalasi solar panel yang tepat sangat menentukan performa dan umur sistem. Banyak proyek solar yang gagal mencapai target produksi energi karena kesalahan dalam tahap perencanaan dan instalasi.

## Survey dan Perencanaan

Langkah pertama adalah melakukan survey lokasi untuk menentukan potensi surya, orientasi atap, dan kondisi struktural. Gunakan data irradiasi surya dari BMKG atau NASA SSE untuk estimasi produksi energi. Hitung kebutuhan daya dan sesuaikan kapasitas panel yang diperlukan dengan mempertimbangkan faktor losses sebesar 15-25%.

## Pemilihan Komponen

Pilih panel surya dengan efisiensi yang sesuai dengan ketersediaan area. Untuk area terbatas, panel monocrystalline PERC dengan efisiensi >20% adalah pilihan terbaik. Inverter harus dipilih dengan kapasitas 10-20% di atas total daya panel untuk mengakomodasi losses dan peningkatan beban di masa depan.

## Instalasi dan Commissioning

Pastikan mounting system terpasang kokoh dan tahan terhadap beban angin minimum 120 km/jam. Kemiringan panel idealnya 10-15° untuk wilayah Indonesia. Setelah instalasi fisik, lakukan commissioning dengan mengukur Voc, Isc, dan daya output aktual untuk memastikan sistem bekerja sesuai spesifikasi.
    `,
    coverImage: "/images/articles/panduan-instalasi-solar.jpg",
    tags: ["solar-panel", "instalasi", "panduan", "rooftop"],
    readingTime: 7,
    isHighlight: true,
    publishedAt: "2024-12-01",
    author: "Tim Arostech",
  },
  {
    id: "hemat-listrik-solar-panel",
    title: "Berapa Bisa Hemat Listrik dengan Solar Panel? Ini Perhitungannya",
    slug: "hemat-listrik-solar-panel",
    category: "solarpanel",
    excerpt:
      "Investasi solar panel rooftop bisa menghemat tagihan listrik PLN secara signifikan. Simak perhitungan detail potensi penghematan dan estimasi waktu balik modal.",
    content: `
Investasi solar panel rooftop bisa menghemat tagihan listrik PLN secara signifikan. Namun, besaran penghematan sangat bergantung pada beberapa faktor yang perlu dipahami sebelum memutuskan berinvestasi.

## Faktor Penentu Penghematan

Penghematan listrik ditentukan oleh irradiasi surya lokasi, kapasitas terpasang, tarif PLN yang berlaku, dan pola konsumsi listrik. Di Indonesia, irradiasi rata-rata 4.5-5.5 kWh/m²/hari memberikan potensi produksi energi yang sangat baik. Untuk pelanggan golongan bisnis (R1/B1 ke atas), penghematan bisa mencapai 30-50% dari tagihan listrik.

## Contoh Perhitungan

Rumah tangga dengan konsumsi 900 kWh/bulan dan tarif Rp 1.444/kWh (golongan R1M), memasang sistem 3.5 kWp dengan produksi rata-rata 420 kWh/bulan. Penghematan: 420 × Rp 1.444 = Rp 606.480/bulan. Dengan investasi sekitar Rp 50 juta, ROI dicapai dalam 7-8 tahun, sementara umur sistem 25+ tahun.

## Skema NEM (Net Energy Metering)

PLN menerapkan skema NEM dimana kelebihan produksi energi surya akan dikonversi menjadi kredit kWh yang dapat digunakan pada bulan berikutnya. Ini memaksimalkan penghematan karena tidak ada energi yang terbuang. Pastikan sistem Anda terdaftar dalam program NEM PLN.
    `,
    coverImage: "/images/articles/hemat-listrik-solar.jpg",
    tags: ["solar-panel", "penghematan", "listrik", "nem", "roi"],
    readingTime: 6,
    isHighlight: false,
    publishedAt: "2024-10-25",
    author: "Tim Arostech",
  },
  {
    id: "perawatan-solar-panel",
    title: "Tips Merawat Solar Panel agar Performa Tetap Optimal",
    slug: "perawatan-solar-panel",
    category: "solarpanel",
    excerpt:
      "Solar panel membutuhkan perawatan minimal, namun rutinitas yang tepat dapat menjaga performa tetap optimal selama 25+ tahun. Berikut panduan perawatan yang mudah diterapkan.",
    content: `
Solar panel membutuhkan perawatan minimal, namun rutinitas yang tepak dapat menjaga performa tetap optimal selama 25+ tahun. Degradasi rata-rata 0.5-0.8% per tahun dapat diminimalkan dengan perawatan yang konsisten.

## Pembersihan Berkala

Debu, polen, dan kotoran burung dapat mengurangi output panel hingga 15-25%. Bersihkan panel setiap 1-3 bulan tergantung kondisi lingkungan. Gunakan air bersih dan spons lembut, hindari bahan kimia keras atau alat abrasif. Waktu terbaik untuk membersihkan adalah pagi atau sore hari saat panel tidak terlalu panas.

## Pemeriksaan Kabel dan Koneksi

Periksa kabel DC dan koneksi MC4 setiap 6 bulan untuk mendeteksi kerusakan, kendor, atau korosi. Pastikan kabel tidak terjepit mounting structure dan tidak terkena gesekan yang dapat mengikili insulasi. Periksa grounding system untuk memastikan keamanan dari sambaran petir.

## Monitoring Performa

Gunakan monitoring system untuk memantau produksi energi harian. Penurunan output yang signifikan dari rata-rata bisa mengindikasikan masalah seperti shading baru, kerusakan sel, atau inverter yang tidak berfungsi optimal. Perbandingan data bulanan dengan estimasi produksi akan membantu mendeteksi masalah lebih awal.
    `,
    coverImage: "/images/articles/perawatan-solar.jpg",
    tags: ["solar-panel", "perawatan", "performa", "monitoring"],
    readingTime: 5,
    isHighlight: false,
    publishedAt: "2024-09-15",
    author: "Tim Arostech",
  },
];

export const companyInfo: CompanyInfo = {
  category: "solarpanel",
  companyName: "Arostech",
  companyDescription:
    "Arostech adalah penyedia solusi panel surya dan energi terbarukan terkemuka di Indonesia. Dengan pengalaman lebih dari 15 tahun, kami menyediakan panel surya monocrystalline berkualitas tinggi mulai dari 5WP hingga 550WP untuk kebutuhan rumah tangga, komersial, dan utilitas. Produk kami menggunakan teknologi terbaru termasuk PERC, half-cut cell, dan multi-busbar untuk efisiensi konversi maksimal.",
  vision:
    "Menjadi penyedia solusi panel surya dan energi terbarukan terdepan di Indonesia yang berkelanjutan, inovatif, dan terjangkau.",
  mission: [
    "Menyediakan panel surya berkualitas tinggi dengan teknologi terkini untuk memaksimalkan produksi energi",
    "Mendorong adopsi energi terbarukan di Indonesia melalui solusi solar yang terjangkau dan andal",
    "Memberikan layanan profesional dari konsultasi desain hingga instalasi dan perawalan purna jual",
    "Mendukung target nasional bauran energi terbarukan 23% pada tahun 2025",
    "Membangun kemitraan strategis dengan pengembang, EPC, dan instansi pemerintah untuk proyek-proyek berskala besar",
  ],
  certifications: [
    {
      name: "SNI",
      description:
        "Standar Nasional Indonesia - Panel surya memenuhi standar keselamatan dan kinerja nasional",
    },
    {
      name: "TKDN",
      description:
        "Tingkat Komponen Dalam Negeri - Mengutamakan komponen produksi dalam negeri",
    },
    {
      name: "IEC 61215",
      description:
        "Standar internasional untuk desain dan kualifikasi modul fotovoltaik crystalline silicon",
    },
  ],
  contactEmail: "info@dayaberkah.id",
  contactPhone: "+62 822-3026-1340",
  whatsappNumber: "6282230261340",
  address:
    "Komplek pergudangan dan, Jl. Industri Kencana Trosobo Jl. Raya Trosobo No.KM 23, Sidorogo, Trosobo, Kec. Taman, Kabupaten Sidoarjo, Jawa Timur 61257",
  workingHours: "Senin – Jumat: 08.00 – 17.00 WIB",
  stats: {
    projectsCompleted: 420,
    yearsExperience: 15,
    citiesCovered: 28,
  },
};

export const projects: Project[] = [
  {
    id: "solar-rooftop-pabrik-sidoarjo",
    title: "Instalasi Solar Rooftop 200 kWp Pabrik Sidoarjo",
    slug: "solar-rooftop-pabrik-sidoarjo",
    category: "solarpanel",
    client: "PT Sidoarjo Manufacturing Indonesia",
    location: "Sidoarjo, Jawa Timur",
    year: 2024,
    description:
      "Proyek instalasi sistem solar rooftop on-grid 200 kWp pada atap pabrik manufaktur di Sidoarjo. Menggunakan 400 unit panel 550WP dengan inverter string 50kW × 4. Sistem ini menghasilkan rata-rata 280 MWh per tahun dan mengurangi tagihan listrik pabrik sebesar 40%.",
    scope: [
      "Survey struktur atap dan analisis beban",
      "Desain sistem dan simulasi produksi energi",
      "Pengadaan 400 unit panel 550WP + inverter + BOS",
      "Instalasi mounting system dan panel",
      "Commissioning dan pengurusan NEM PLN",
    ],
    results: [
      "Produksi energi 280 MWh/tahun",
      "Penghematan tagihan listrik 40%",
      "Pengurangan emisi CO2 200 ton/tahun",
      "ROI estimasi 5.5 tahun",
    ],
    productCategory: "Solar Panel Besar",
    projectScale: "Besar",
    duration: "4 bulan",
    coverImage: "/images/projects/solar-rooftop-pabrik.jpg",
    isHighlight: true,
    tags: ["solar-panel", "rooftop", "on-grid", "industri"],
  },
  {
    id: "solar-off-grid-desa-kalimantan",
    title: "Sistem Solar Off-Grid untuk Desa Terpencil Kalimantan",
    slug: "solar-off-grid-desa-kalimantan",
    category: "solarpanel",
    client: "Pemerintah Kabupaten Kutai Kartanegara",
    location: "Kutai Kartanegara, Kalimantan Timur",
    year: 2024,
    description:
      "Pemasangan sistem solar off-grid di 8 desa terpencil yang belum terjangkau jaringan PLN di Kutai Kartanegara. Setiap desa dilengkapi dengan sistem solar 10 kWp, bank baterai 48V 200Ah, dan inverter hybrid untuk melayani kebutuhan listrik rumah tangga dan fasilitas umum.",
    scope: [
      "Survey lokasi dan potensi surya 8 desa",
      "Pengadaan 160 unit panel 100WP + BOS per desa",
      "Instalasi solar panel, baterai, dan inverter",
      "Distribusi listrik ke rumah tangga",
      "Pelatihan operator desa",
    ],
    results: [
      "Listrik untuk 500+ rumah tangga di 8 desa",
      "0% biaya operasional energi",
      "Produksi energi rata-rata 40 kWh/desa/hari",
      "Mendukung aktivitas ekonomi dan pendidikan",
    ],
    productCategory: "Solar Panel Kecil",
    projectScale: "Menengah",
    duration: "6 bulan",
    coverImage: "/images/projects/solar-off-grid-kalimantan.jpg",
    isHighlight: true,
    tags: ["solar-panel", "off-grid", "desa-terpencil", "kalimantan"],
  },
  {
    id: "solar-rooftop-perkantoran-jakarta",
    title: "Solar Rooftop Gedung Perkantoran Jakarta",
    slug: "solar-rooftop-perkantoran-jakarta",
    category: "solarpanel",
    client: "PT Jakarta Green Building Management",
    location: "Jakarta Selatan, DKI Jakarta",
    year: 2023,
    description:
      "Instalasi sistem solar rooftop 100 kWp pada gedung perkantoran 8 lantai di Jakarta Selatan sebagai bagian dari program green building. Sistem menggunakan 286 unit panel 350WP PERC dengan optimasi untuk atap datar menggunakan mounting system tilt 10°.",
    scope: [
      "Audit energi dan desain sistem green building",
      "Pengadaan 286 unit panel 350WP + inverter + BOS",
      "Instalasi mounting system tilt untuk atap datar",
      "Integrasi dengan BMS gedung",
      "Monitoring system real-time",
    ],
    results: [
      "Penghematan tagihan listrik 35%",
      "Sertifikasi green building EDGE",
      "Pengurangan emisi CO2 100 ton/tahun",
      "Monitoring performa real-time via dashboard",
    ],
    productCategory: "Solar Panel Besar",
    projectScale: "Menengah",
    duration: "3 bulan",
    coverImage: "/images/projects/solar-rooftop-jakarta.jpg",
    isHighlight: false,
    tags: ["solar-panel", "rooftop", "green-building", "jakarta"],
  },
];
