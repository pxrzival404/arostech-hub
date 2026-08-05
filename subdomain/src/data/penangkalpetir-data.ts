import type { Product, Article, CompanyInfo, Project } from "@/types";

export const products: Product[] = [
  // === KURN ===
  {
    id: "penangkal-petir-kurn-1",
    name: "Penangkal Petir Kurn Series 1",
    slug: "penangkal-petir-kurn-1",
    category: "penangkalpetir",
    subcategory: "kurn",
    description:
      "Penangkal petir Kurn Series 1 dengan teknologi ESE (Early Streamer Emission) yang mampu memperluas area proteksi secara signifikan dibandingkan penangkal petir konvensional. Head penangkal petir terbuat dari stainless steel 316L yang tahan korosi dan cuaca ekstrem. Dilengkapi dengan test button untuk verifikasi kondisi elektronik secara berkala.",
    specifications: [
      { label: "Tipe", value: "ESE (Early Streamer Emission)" },
      { label: "Radius Proteksi", value: "40 meter (tinggi instalasi 10m)" },
      { label: "Material Head", value: "Stainless Steel 316L" },
      { label: "Tegangan Trigger", value: "< 1 μs" },
      { label: "Sertifikasi", value: "NFC 17-102" },
      { label: "Garansi", value: "5 tahun" },
    ],
    images: ["/images/products/penangkal-petir-kurn-1.jpg"],
    highlights: [
      "Teknologi ESE area proteksi luas",
      "Stainless Steel 316L anti korosi",
      "Test button untuk verifikasi berkala",
    ],
    isHighlight: true,
    tags: ["penangkal-petir", "kurn", "ese", "stainless-steel"],
    specificationMethod: "from-specs",
  },
  {
    id: "penangkal-petir-kurn-2",
    name: "Penangkal Petir Kurn Series 2",
    slug: "penangkal-petir-kurn-2",
    category: "penangkalpetir",
    subcategory: "kurn",
    description:
      "Penangkal petir Kurn Series 2 merupakan versi premium dengan kapasitas ESE yang lebih besar untuk proteksi area yang lebih luas. Dilengkapi dengan indikator visual yang memudahkan inspeksi kondisi unit dari jarak jauh. Desain aerodinamis mengurangi hambatan angin pada tiang penangkal petir.",
    specifications: [
      { label: "Tipe", value: "ESE (Early Streamer Emission)" },
      { label: "Radius Proteksi", value: "60 meter (tinggi instalasi 10m)" },
      { label: "Material Head", value: "Stainless Steel 316L" },
      { label: "Tegangan Trigger", value: "< 0.8 μs" },
      { label: "Sertifikasi", value: "NFC 17-102" },
      { label: "Garansi", value: "5 tahun" },
    ],
    images: ["/images/products/penangkal-petir-kurn-2.jpg"],
    highlights: [
      "Radius proteksi lebih luas",
      "Indikator visual untuk inspeksi jarak jauh",
      "Desain aerodinamis",
    ],
    isHighlight: true,
    tags: ["penangkal-petir", "kurn", "ese", "premium"],
    specificationMethod: "from-specs",
  },

  // === VIKING ===
  {
    id: "penangkal-petir-viking-1",
    name: "Penangkal Petir Viking V-25",
    slug: "penangkal-petir-viking-1",
    category: "penangkalpetir",
    subcategory: "viking",
    description:
      "Penangkal petir Viking V-25 dengan sistem ESE yang telah teruji di laboratorium high voltage. Menggunakan generator impuls yang menghasilkan leader lebih awal dari penangkal petir konvensional, sehingga menangkap sambaran petir dengan area proteksi yang lebih luas. Cocok untuk gedung perkantoran dan fasilitas komersial.",
    specifications: [
      { label: "Tipe", value: "ESE (Early Streamer Emission)" },
      { label: "Radius Proteksi", value: "40 meter (tinggi instalasi 10m)" },
      { label: "Material Head", value: "Stainless Steel 304" },
      { label: "ΔT (Advance Time)", value: "25 μs" },
      { label: "Sertifikasi", value: "NFC 17-102, UNE 21186" },
      { label: "Garansi", value: "3 tahun" },
    ],
    images: ["/images/products/penangkal-petir-viking-1.jpg"],
    highlights: [
      "Teruji di laboratorium high voltage",
      "ΔT 25μs untuk proteksi optimal",
      "Cocok untuk gedung perkantoran",
    ],
    isHighlight: true,
    tags: ["penangkal-petir", "viking", "ese", "v-25"],
    specificationMethod: "from-specs",
  },
  {
    id: "penangkal-petir-viking-2",
    name: "Penangkal Petir Viking V-40",
    slug: "penangkal-petir-viking-2",
    category: "penangkalpetir",
    subcategory: "viking",
    description:
      "Penangkal petir Viking V-40 dengan ΔT 40μs memberikan area proteksi yang lebih luas untuk bangunan tinggi dan fasilitas industri. Head unit menggunakan material stainless steel premium dengan finishing chrome yang tahan terhadap kondisi cuaca tropis Indonesia. Sistem pemasangan kompatibel dengan berbagai jenis tiang penangkal petir.",
    specifications: [
      { label: "Tipe", value: "ESE (Early Streamer Emission)" },
      { label: "Radius Proteksi", value: "60 meter (tinggi instalasi 10m)" },
      { label: "Material Head", value: "Stainless Steel 304 Chrome Finish" },
      { label: "ΔT (Advance Time)", value: "40 μs" },
      { label: "Sertifikasi", value: "NFC 17-102, UNE 21186" },
      { label: "Garansi", value: "3 tahun" },
    ],
    images: ["/images/products/penangkal-petir-viking-2.jpg"],
    highlights: [
      "ΔT 40μs proteksi area luas",
      "Finishing chrome tahan cuaca tropis",
      "Kompatibel berbagai jenis tiang",
    ],
    isHighlight: false,
    tags: ["penangkal-petir", "viking", "ese", "v-40"],
    specificationMethod: "from-specs",
  },

  // === ERICO ===
  {
    id: "penangkal-petir-erico-1",
    name: "Penangkal Petir Erico ESE-15",
    slug: "penangkal-petir-erico-1",
    category: "penangkalpetir",
    subcategory: "erico",
    description:
      "Penangkal petir Erico ESE-15 dari brand internasional ERICO yang telah dipercaya di lebih dari 100 negara. Menggunakan teknologi ESE dengan advance time 15μs yang sesuai standar NFC 17-102. Unit ini direkomendasikan untuk bangunan dengan ketinggian sedang dan area yang memerlukan proteksi menengah.",
    specifications: [
      { label: "Tipe", value: "ESE (Early Streamer Emission)" },
      { label: "Radius Proteksi", value: "32 meter (tinggi instalasi 10m)" },
      { label: "Material Head", value: "Aluminium Alloy + Stainless Steel" },
      { label: "ΔT (Advance Time)", value: "15 μs" },
      { label: "Sertifikasi", value: "NFC 17-102, IEC 62793" },
      { label: "Garansi", value: "5 tahun" },
    ],
    images: ["/images/products/penangkal-petir-erico-1.jpg"],
    highlights: [
      "Brand internasional ERICO",
      "Dipercaya di 100+ negara",
      "Sesuai standar IEC 62793",
    ],
    isHighlight: false,
    tags: ["penangkal-petir", "erico", "ese", "internasional"],
    specificationMethod: "from-specs",
  },
  {
    id: "penangkal-petir-erico-2",
    name: "Penangkal Petir Erico ESE-30",
    slug: "penangkal-petir-erico-2",
    category: "penangkalpetir",
    subcategory: "erico",
    description:
      "Penangkal petir Erico ESE-30 dengan advance time 30μs untuk proteksi area luas pada bangunan industri dan komersial. Menggunakan sensor ionisasi ganda yang meningkatkan sensitivitas deteksi awan bermuatan. Konstruksi head unit dari aluminium alloy dengan coating anti-UV untuk ketahanan maksimal di iklim tropis.",
    specifications: [
      { label: "Tipe", value: "ESE (Early Streamer Emission)" },
      { label: "Radius Proteksi", value: "50 meter (tinggi instalasi 10m)" },
      { label: "Material Head", value: "Aluminium Alloy + Anti-UV Coating" },
      { label: "ΔT (Advance Time)", value: "30 μs" },
      { label: "Sertifikasi", value: "NFC 17-102, IEC 62793" },
      { label: "Garansi", value: "5 tahun" },
    ],
    images: ["/images/products/penangkal-petir-erico-2.jpg"],
    highlights: [
      "Sensor ionisasi ganda",
      "Coating anti-UV untuk iklim tropis",
      "Ideal untuk bangunan industri",
    ],
    isHighlight: false,
    tags: ["penangkal-petir", "erico", "ese", "industri"],
    specificationMethod: "from-specs",
  },

  // === LPI GUARDIAN ===
  {
    id: "penangkal-petir-lpi-guardian-1",
    name: "LPI Guardian Series 1",
    slug: "penangkal-petir-lpi-guardian-1",
    category: "penangkalpetir",
    subcategory: "lpi-guardian",
    description:
      "LPI Guardian Series 1 merupakan penangkal petir ESE dari Lightning Protection International yang dirancang khusus untuk kondisi tropis. Sistem trigger elektronik yang responsif menghasilkan upward leader lebih cepat dari penangkal petir konvensional. Dilengkapi dengan counter yang merekam jumlah sambaran yang diterima.",
    specifications: [
      { label: "Tipe", value: "ESE (Early Streamer Emission)" },
      { label: "Radius Proteksi", value: "43 meter (tinggi instalasi 10m)" },
      { label: "Material Head", value: "Stainless Steel 316" },
      { label: "ΔT (Advance Time)", value: "25 μs" },
      { label: "Sertifikasi", value: "NFC 17-102" },
      { label: "Fitur Khusus", value: "Lightning Strike Counter" },
    ],
    images: ["/images/products/penangkal-petir-lpi-guardian-1.jpg"],
    highlights: [
      "Dirancang untuk iklim tropis",
      "Lightning strike counter built-in",
      "Stainless Steel 316 premium",
    ],
    isHighlight: false,
    tags: ["penangkal-petir", "lpi", "guardian", "ese"],
    specificationMethod: "from-specs",
  },
  {
    id: "penangkal-petir-lpi-guardian-2",
    name: "LPI Guardian Series 2",
    slug: "penangkal-petir-lpi-guardian-2",
    category: "penangkalpetir",
    subcategory: "lpi-guardian",
    description:
      "LPI Guardian Series 2 dengan advance time lebih tinggi untuk proteksi bangunan bertingkat tinggi dan fasilitas kritis. Dilengkapi dengan sistem monitoring yang dapat dihubungkan ke BMS (Building Management System) untuk pemantauan kondisi penangkal petir secara real-time. Material head unit tahan terhadap lingkungan pesisir dan industri.",
    specifications: [
      { label: "Tipe", value: "ESE (Early Streamer Emission)" },
      { label: "Radius Proteksi", value: "63 meter (tinggi instalasi 10m)" },
      { label: "Material Head", value: "Stainless Steel 316L Marine Grade" },
      { label: "ΔT (Advance Time)", value: "40 μs" },
      { label: "Sertifikasi", value: "NFC 17-102, IEC 62793" },
      { label: "Fitur Khusus", value: "BMS Monitoring Ready" },
    ],
    images: ["/images/products/penangkal-petir-lpi-guardian-2.jpg"],
    highlights: [
      "Marine grade untuk lingkungan pesisir",
      "BMS monitoring ready",
      "ΔT 40μs proteksi area luas",
      "Ideal untuk bangunan bertingkat tinggi",
    ],
    isHighlight: false,
    tags: ["penangkal-petir", "lpi", "guardian", "monitoring"],
    specificationMethod: "from-specs",
  },

  // === THOMAS ===
  {
    id: "penangkal-petir-thomas-1",
    name: "Penangkal Petir Thomas T-40",
    slug: "penangkal-petir-thomas-1",
    category: "penangkalpetir",
    subcategory: "thomas",
    description:
      "Penangkal petir Thomas T-40 dengan teknologi ESE yang telah digunakan di ribuan instalasi di Indonesia. Desain head unit yang ergonomis dan aerodinamis meminimalkan hambatan angin dan memaksimalkan kemampuan menangkap sambaran petir. Kompatibel dengan sistem grounding standar SNI untuk integrasi yang mudah.",
    specifications: [
      { label: "Tipe", value: "ESE (Early Streamer Emission)" },
      { label: "Radius Proteksi", value: "50 meter (tinggi instalasi 10m)" },
      { label: "Material Head", value: "Stainless Steel 304" },
      { label: "ΔT (Advance Time)", value: "40 μs" },
      { label: "Sertifikasi", value: "NFC 17-102" },
      { label: "Garansi", value: "3 tahun" },
    ],
    images: ["/images/products/penangkal-petir-thomas-1.jpg"],
    highlights: [
      "Ribuan instalasi di Indonesia",
      "Desain aerodinamis",
      "Kompatibel grounding SNI",
    ],
    isHighlight: false,
    tags: ["penangkal-petir", "thomas", "ese", "t-40"],
    specificationMethod: "from-specs",
  },
  {
    id: "penangkal-petir-thomas-2",
    name: "Penangkal Petir Thomas T-60",
    slug: "penangkal-petir-thomas-2",
    category: "penangkalpetir",
    subcategory: "thomas",
    description:
      "Penangkal petir Thomas T-60 merupakan seri premium dengan ΔT 60μs untuk area proteksi maksimal. Sistem elektronik trigger dengan redundansi ganda memastikan keandalan operasional. Cocok untuk instalasi di area dengan kerapatan petir tinggi seperti daerah tropis Indonesia yang memiliki 200+ hari badai per tahun.",
    specifications: [
      { label: "Tipe", value: "ESE (Early Streamer Emission)" },
      { label: "Radius Proteksi", value: "79 meter (tinggi instalasi 10m)" },
      { label: "Material Head", value: "Stainless Steel 316" },
      { label: "ΔT (Advance Time)", value: "60 μs" },
      { label: "Sertifikasi", value: "NFC 17-102" },
      { label: "Fitur Khusus", value: "Redundansi Trigger Ganda" },
    ],
    images: ["/images/products/penangkal-petir-thomas-2.jpg"],
    highlights: [
      "ΔT 60μs area proteksi maksimal",
      "Redundansi trigger ganda",
      "Untuk area kerapatan petir tinggi",
    ],
    isHighlight: false,
    tags: ["penangkal-petir", "thomas", "ese", "t-60", "premium"],
    specificationMethod: "from-specs",
  },

  // === EF ===
  {
    id: "penangkal-petir-ef-1",
    name: "Penangkal Petir EF-01",
    slug: "penangkal-petir-ef-1",
    category: "penangkalpetir",
    subcategory: "ef",
    description:
      "Penangkal Petir EF-01 menggunakan prinsip Elektrostatik Fluks yang mengoptimalkan pengumpulan muatan listrik di atmosfer sekitar. Teknologi ini menghasilkan jalur ionisasi yang terarah menuju awan bermuatan, meningkatkan probabilitas penangkapan sambaran petir. Desain compact memudahkan instalasi pada tiang yang relatif pendek.",
    specifications: [
      { label: "Tipe", value: "Elektrostatik Fluks" },
      { label: "Radius Proteksi", value: "35 meter (tinggi instalasi 10m)" },
      { label: "Material Head", value: "Aluminium Alloy + Copper Tip" },
      { label: "Tegangan Operasi", value: "1 kV - 3 MV" },
      { label: "Sertifikasi", value: "SNI, NFC 17-102" },
      { label: "Garansi", value: "3 tahun" },
    ],
    images: ["/images/products/penangkal-petir-ef-1.jpg"],
    highlights: [
      "Prinsip Elektrostatik Fluks",
      "Jalur ionisasi terarah",
      "Desain compact mudah instalasi",
    ],
    isHighlight: false,
    tags: ["penangkal-petir", "ef", "elektrostatik", "ef-01"],
    specificationMethod: "from-specs",
  },
  {
    id: "penangkal-petir-ef-2",
    name: "Penangkal Petir EF-03",
    slug: "penangkal-petir-ef-2",
    category: "penangkalpetir",
    subcategory: "ef",
    description:
      "Penangkal Petir EF-03 merupakan seri terkuat dari lini EF dengan kapasitas penangkapan yang ditingkatkan untuk area proteksi yang lebih luas. Menggunakan teknologi Elektrostatik Fluks generasi kedua dengan elektroda multipoint yang menghasilkan korona discharge lebih intensif. Ideal untuk fasilitas kritis seperti kilang, pembangkit listrik, dan gedung bertingkat tinggi.",
    specifications: [
      { label: "Tipe", value: "Elektrostatik Fluks Gen-2" },
      { label: "Radius Proteksi", value: "55 meter (tinggi instalasi 10m)" },
      { label: "Material Head", value: "Stainless Steel 316L + Copper" },
      { label: "Elektroda", value: "Multipoint (16 titik)" },
      { label: "Sertifikasi", value: "SNI, NFC 17-102" },
      { label: "Garansi", value: "5 tahun" },
    ],
    images: ["/images/products/penangkal-petir-ef-2.jpg"],
    highlights: [
      "Elektroda multipoint 16 titik",
      "Korona discharge lebih intensif",
      "Ideal untuk fasilitas kritis",
      "Generasi ke-2 teknologi EF",
    ],
    isHighlight: false,
    tags: ["penangkal-petir", "ef", "elektrostatik", "ef-03", "kritis"],
    specificationMethod: "from-specs",
  },
];

export const articles: Article[] = [
  {
    id: "cara-kerja-penangkal-petir-ese",
    title: "Cara Kerja Penangkal Petir ESE: Teknologi Proteksi Kilat Modern",
    slug: "cara-kerja-penangkal-petir-ese",
    category: "penangkalpetir",
    excerpt:
      "Penangkal petir ESE (Early Streamer Emission) merupakan teknologi proteksi kilat terkini yang menawarkan area proteksi jauh lebih luas dibandingkan penangkal petir konvensional. Pelajari prinsip kerjanya.",
    content: `
Penangkal petir ESE (Early Streamer Emission) merupakan teknologi proteksi kilat terkini yang menawarkan area proteksi jauh lebih luas dibandingkan penangkal petir konvensional. Memahami prinsip kerjanya sangat penting untuk memilih sistem proteksi yang tepat.

## Prinsip Dasar Penangkal Petir

Sambaran petir terjadi ketika perbedaan potensial antara awan dan bumi mencapai titik breakdown udara. Proses ini dimulai dengan downward leader dari awan yang bergerak menuju bumi. Ketika downward leader mendekati permukaan, objek tertinggi di area tersebut akan menghasilkan upward leader yang menyambungkan jalur sambaran.

## Keunggulan Teknologi ESE

Penangkal petir ESE menghasilkan upward leader lebih awal (ΔT mikrodetik) dibandingkan penangkal petir konvensional. Semakin cepat upward leader dilepaskan, semakin awal jalur sambaran terbentuk, dan semakin luas area proteksi. Berdasarkan standar NFC 17-102, radius proteksi ESE dihitung berdasarkan nilai ΔT dan ketinggian instalasi.

## Standar dan Sertifikasi

Standar internasional yang mengatur penangkal petir ESE meliputi NFC 17-102 (Prancis), UNE 21186 (Spanyol), dan IEC 62793. Pastikan produk yang Anda pilih telah melewati pengujian di laboratorium yang terakreditasi dan memiliki sertifikasi yang valid.
    `,
    coverImage: "/images/articles/cara-kerja-ese.jpg",
    tags: ["penangkal-petir", "ese", "teknologi", "proteksi-kilat"],
    readingTime: 6,
    isHighlight: true,
    publishedAt: "2024-11-20",
    author: "Tim Arostech",
  },
  {
    id: "panduan-instalasi-penangkal-petir",
    title: "Panduan Instalasi Penangkal Petir Sesuai Standar SNI",
    slug: "panduan-instalasi-penangkal-petir",
    category: "penangkalpetir",
    excerpt:
      "Instalasi penangkal petir yang tidak sesuai standar dapat mengancam keselamatan penghuni bangunan. Ikuti panduan instalasi lengkap berdasarkan SNI 03-7015-2004.",
    content: `
Instalasi penangkal petir yang tidak sesuai standar dapat mengancam keselamatan penghuni bangunan. Banyak kegagalan proteksi bukan disebabkan oleh produk yang buruk, melainkan oleh instalasi yang tidak memenuhi standar.

## Komponen Sistem Penangkal Petir

Sistem penangkal petir terdiri dari tiga komponen utama: air terminal (head penangkal petir), down conductor (kabel penyalur), dan grounding system (sistem pembumian). Ketiga komponen harus bekerja sebagai satu kesatuan yang terintegrasi. Kelemahan pada satu komponen akan mengurangi efektivitas keseluruhan sistem.

## Sistem Grounding

Grounding merupakan komponen paling kritis dalam sistem penangkal petir. Resistansi grounding harus kurang dari 5 ohm untuk instalasi biasa dan kurang dari 1 ohm untuk fasilitas kritis. Gunakan electrode copperbond dengan panjang minimum 3 meter yang ditanam pada tanah dengan kelembaban memadai. Tambahkan baclo atau chemical grounding jika resistansi alami tanah terlalu tinggi.

## Inspeksi Berkala

SNI 03-7015-2004 mewajibkan inspeksi sistem penangkal petir setiap tahun. Inspeksi meliputi pengukuran resistansi grounding, pemeriksaan visual koneksi dan down conductor, serta verifikasi kondisi head penangkal petir. Catat hasil inspeksi dalam log book untuk keperluan audit dan sertifikasi.
    `,
    coverImage: "/images/articles/instalasi-penangkal-petir.jpg",
    tags: ["penangkal-petir", "instalasi", "sni", "grounding"],
    readingTime: 7,
    isHighlight: false,
    publishedAt: "2024-10-10",
    author: "Tim Arostech",
  },
  {
    id: "memilih-penangkal-petir-yang-tepat",
    title: "Memilih Penangkal Petir yang Tepat: Panduan untuk Berbagai Jenis Bangunan",
    slug: "memilih-penangkal-petir-yang-tepat",
    category: "penangkalpetir",
    excerpt:
      "Setiap bangunan memiliki kebutuhan proteksi petir yang berbeda. Artikel ini membantu Anda memilih jenis dan kapasitas penangkal petir yang sesuai dengan karakteristik bangunan.",
    content: `
Setiap bangunan memiliki kebutuhan proteksi petir yang berbeda berdasarkan ketinggian, lokasi, dan fungsi bangunan. Memilih penangkal petir yang tepat memerlukan pemahaman terhadap tingkat risiko dan standar yang berlaku.

## Analisis Risiko Petir

Langkah pertama adalah melakukan analisis risiko berdasarkan SNI IEC 62305-2. Faktor yang dipertimbangkan meliputi densitas petir di lokasi (Ng), luas area koleksi setara (Ae), nilai bangunan dan isinya, serta konsekuensi kerusakan. Indonesia memiliki densitas petir tinggi dengan 100-200 hari badai per tahun di sebagian besar wilayah.

## Level Proteksi

IEC 62305 mendefinisikan empat level proteksi (LPL I-IV). LPL I memberikan proteksi tertinggi untuk fasilitas kritis seperti rumah sakit, pembangkit listrik, dan kilang. LPL IV cukup untuk bangunan biasa dengan risiko rendah. Pemilihan level proteksi ditentukan oleh hasil analisis risiko dan pertimbangan ekonomis.

## Penangkal Petir ESE vs Konvensional

Penangkal petir ESE menguntungkan karena area proteksi yang lebih luas dengan jumlah titik yang lebih sedikit, mengurangi biaya instalasi dan estetika bangunan. Namun, untuk bangunan dengan area atap yang kompleks, kombinasi ESE dan Faraday cage mungkin memberikan proteksi yang lebih komprehensif. Konsultasikan dengan ahli proteksi petir bersertifikasi untuk mendapatkan solusi terbaik.
    `,
    coverImage: "/images/articles/memilih-penangkal-petir.jpg",
    tags: ["penangkal-petir", "pemilihan", "analisis-risiko", "sni"],
    readingTime: 8,
    isHighlight: false,
    publishedAt: "2024-09-05",
    author: "Tim Arostech",
  },
];

export const companyInfo: CompanyInfo = {
  category: "penangkalpetir",
  companyName: "Arostech",
  companyDescription:
    "Arostech adalah penyedia solusi penangkal petir dan proteksi kilat terkemuka di Indonesia. Dengan pengalaman lebih dari 15 tahun, kami menyediakan berbagai merek penangkal petir ESE berkualitas tinggi termasuk Kurn, Viking, Erico, LPI Guardian, Thomas, dan EF. Layanan kami mencakup konsultasi analisis risiko, desain sistem proteksi, instalasi, dan inspeksi berkala sesuai standar SNI dan internasional.",
  vision:
    "Menjadi penyedia solusi proteksi kilat dan penangkal petir terdepan di Indonesia yang mengutamakan keselamatan, keandalan, dan kepatuhan standar.",
  mission: [
    "Menyediakan sistem penangkal petir berkualitas tinggi dari berbagai merek terpercaya dunia",
    "Memberikan layanan analisis risiko dan desain sistem proteksi yang sesuai standar SNI dan IEC 62305",
    "Melaksanakan instalasi profesional dengan material dan workmanship terbaik",
    "Menyediakan layanan inspeksi dan perawatan berkala untuk menjamin keandalan sistem proteksi",
    "Meningkatkan kesadaran masyarakat akan pentingnya proteksi kilat melalui edukasi dan sosialisasi",
  ],
  certifications: [
    {
      name: "SNI 03-7015-2004",
      description:
        "Standar Nasional Indonesia untuk sistem penangkal petir pada bangunan",
    },
    {
      name: "NFC 17-102",
      description:
        "Standar internasional untuk penangkal petir ESE (Early Streamer Emission)",
    },
    {
      name: "IEC 62305",
      description:
        "Standar internasional untuk proteksi petir - analisis risiko dan desain sistem",
    },
  ],
  contactEmail: "info@dayaberkah.id",
  contactPhone: "+62 822-3026-1340",
  whatsappNumber: "6282230261340",
  address:
    "Komplek pergudangan dan, Jl. Industri Kencana Trosobo Jl. Raya Trosobo No.KM 23, Sidorogo, Trosobo, Kec. Taman, Kabupaten Sidoarjo, Jawa Timur 61257",
  workingHours: "Senin – Jumat: 08.00 – 17.00 WIB",
  stats: {
    projectsCompleted: 600,
    yearsExperience: 15,
    citiesCovered: 35,
  },
};

export const projects: Project[] = [
  {
    id: "penangkal-petir-gedung-surabaya",
    title: "Instalasi Penangkal Petir Gedung Perkantoran Surabaya",
    slug: "penangkal-petir-gedung-surabaya",
    category: "penangkalpetir",
    client: "PT Surabaya Tower Management",
    location: "Surabaya, Jawa Timur",
    year: 2024,
    description:
      "Proyek instalasi sistem penangkal petir ESE pada gedung perkantoran 20 lantai di pusat kota Surabaya. Menggunakan 4 titik penangkal petir Viking V-40 dengan down conductor tembaga dan sistem grounding deep well. Sistem dirancang sesuai SNI 03-7015-2004 dan IEC 62305 Level II.",
    scope: [
      "Analisis risiko petir sesuai IEC 62305-2",
      "Desain sistem proteksi Level II",
      "Pengadaan 4 unit Viking V-40 + down conductor + grounding",
      "Instalasi pada rooftop 20 lantai",
      "Pengujian resistansi grounding dan commissioning",
    ],
    results: [
      "Resistansi grounding 0.8 ohm (target < 5 ohm)",
      "Area proteksi 100% tercakup",
      "Sertifikasi instalasi dari lembaga terakreditasi",
      "Garansi instalasi 2 tahun",
    ],
    productCategory: "Penangkal Petir Viking",
    projectScale: "Besar",
    duration: "2 bulan",
    coverImage: "/images/projects/penangkal-petir-gedung.jpg",
    isHighlight: true,
    tags: ["penangkal-petir", "viking", "gedung-tinggi", "surabaya"],
  },
  {
    id: "penangkal-petir-pabrik-gresik",
    title: "Sistem Proteksi Petir Kawasan Industri Gresik",
    slug: "penangkal-petir-pabrik-gresik",
    category: "penangkalpetir",
    client: "PT Gresik Industrial Zone",
    location: "Gresik, Jawa Timur",
    year: 2024,
    description:
      "Instalasi sistem proteksi petir komprehensif untuk kawasan industri seluas 5 hektar yang mencakup 3 bangunan pabrik, gudang, dan kantor. Menggunakan kombinasi 6 unit penangkal petir Kurn Series 2 dan sistem Faraday cage pada atap baja. Grounding sistem terintegrasi dengan equipotential bonding sesuai IEC 62305.",
    scope: [
      "Survey dan analisis risiko seluruh kawasan",
      "Desain sistem proteksi campuran ESE + Faraday cage",
      "Pengadaan 6 unit Kurn Series 2 + BOS",
      "Instalasi down conductor dan equipotential bonding",
      "Pengujian menyeluruh dan sertifikasi",
    ],
    results: [
      "Proteksi 100% area kawasan industri",
      "Resistansi grounding rata-rata 1.2 ohm",
      "Equipotential bonding terintegrasi",
      "Memenuhi standar asuransi industri",
    ],
    productCategory: "Penangkal Petir Kurn",
    projectScale: "Besar",
    duration: "3 bulan",
    coverImage: "/images/projects/penangkal-petir-industri.jpg",
    isHighlight: true,
    tags: ["penangkal-petir", "kurn", "industri", "faraday-cage"],
  },
  {
    id: "penangkal-petir-rumah-sakit-malang",
    title: "Proteksi Petir Rumah Sakit Malang",
    slug: "penangkal-petir-rumah-sakit-malang",
    category: "penangkalpetir",
    client: "RS Umum Malang Medika",
    location: "Malang, Jawa Timur",
    year: 2023,
    description:
      "Instalasi sistem proteksi petir Level I untuk rumah sakit dengan peralatan medis sensitif. Menggunakan 3 unit Erico ESE-30 dengan surge protection device (SPD) pada panel listrik untuk proteksi peralatan medis dari transient voltage. Sistem grounding terpisah antara proteksi petir dan grounding instalasi listrik untuk menghindari potensi difference.",
    scope: [
      "Analisis risiko Level I untuk fasilitas kesehatan",
      "Pengadaan 3 unit Erico ESE-30 + SPD + BOS",
      "Instalasi grounding terpisah (petir & listrik)",
      "Pemasangan SPD pada 8 panel distribusi",
      "Training staf pemeliharaan rumah sakit",
    ],
    results: [
      "Proteksi Level I sesuai IEC 62305",
      "0 insiden kerusakan peralatan akibat petir",
      "SPD melindungi peralatan medis sensitif",
      "Inspeksi tahunan terjadwal",
    ],
    productCategory: "Penangkal Petir Erico",
    projectScale: "Menengah",
    duration: "1.5 bulan",
    coverImage: "/images/projects/penangkal-petir-rumah-sakit.jpg",
    isHighlight: false,
    tags: ["penangkal-petir", "erico", "rumah-sakit", "spd"],
  },
];
