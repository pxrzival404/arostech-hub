import type { Product, Article, CompanyInfo, Project } from "@/types";

export const products: Product[] = [
  {
    id: "baterai-12v-5ah",
    name: "Baterai 12V 5Ah",
    slug: "baterai-12v-5ah",
    category: "baterai",
    subcategory: "baterai-12v",
    description:
      "Baterai 12V 5Ah merupakan baterai VRLA (Valve Regulated Lead Acid) dengan kapasitas kecil yang ideal untuk sistem UPS kecil, alarm keamanan, dan perangkat elektronik darurat. Baterai ini menggunakan teknologi AGM (Absorbent Glass Mat) yang menjadikannya bebas perawatan dan aman digunakan dalam posisi apapun. Cocok untuk aplikasi standby dan siklus dangkal dengan umur layanan yang andal.",
    specifications: [
      { label: "Tegangan Nominal", value: "12V" },
      { label: "Kapasitas", value: "5Ah (C20)" },
      { label: "Tipe", value: "VRLA AGM" },
      { label: "Dimensi", value: "90 x 70 x 107 mm" },
      { label: "Berat", value: "1.5 kg" },
      { label: "Umur Layanan", value: "3-5 tahun" },
    ],
    images: ["/images/products/baterai-12v-5ah.jpg"],
    highlights: [
      "Bebas perawatan (maintenance free)",
      "Teknologi AGM anti tumpah",
      "Cocok untuk UPS dan alarm keamanan",
    ],
    isHighlight: true,
    tags: ["baterai", "12v", "5ah", "vrla", "agm"],
    specificationMethod: "from-specs",
  },
  {
    id: "baterai-12v-20ah",
    name: "Baterai 12V 20Ah",
    slug: "baterai-12v-20ah",
    category: "baterai",
    subcategory: "baterai-12v",
    description:
      "Baterai 12V 20Ah dengan teknologi VRLA AGM yang dirancang untuk aplikasi UPS menengah, sistem keamanan, dan perangkat medis. Menawarkan keseimbangan optimal antara kapasitas dan ukuran fisik yang kompak. Dilengkapi dengan terminal standar F2 untuk kemudahan instalasi dan konektivitas yang andal.",
    specifications: [
      { label: "Tegangan Nominal", value: "12V" },
      { label: "Kapasitas", value: "20Ah (C20)" },
      { label: "Tipe", value: "VRLA AGM" },
      { label: "Dimensi", value: "181 x 76 x 167 mm" },
      { label: "Berat", value: "5.8 kg" },
      { label: "Umur Layanan", value: "3-5 tahun" },
    ],
    images: ["/images/products/baterai-12v-20ah.jpg"],
    highlights: [
      "Kapasitas menengah serbaguna",
      "Terminal F2 standar industri",
      "Desain kompak hemat ruang",
    ],
    isHighlight: true,
    tags: ["baterai", "12v", "20ah", "vrla", "agm"],
    specificationMethod: "from-specs",
  },
  {
    id: "baterai-12v-45ah",
    name: "Baterai 12V 45Ah",
    slug: "baterai-12v-45ah",
    category: "baterai",
    subcategory: "baterai-12v",
    description:
      "Baterai 12V 45Ah VRLA AGM untuk aplikasi UPS skala menengah hingga besar, sistem penerangan darurat, dan perangkat telekomunikasi. Konstruksi internal yang kokoh memberikan performa charge-discharge yang stabil dalam berbagai kondisi operasi. Baterai ini juga cocok untuk sistem solar panel off-grid skala kecil sebagai penyimpanan energi.",
    specifications: [
      { label: "Tegangan Nominal", value: "12V" },
      { label: "Kapasitas", value: "45Ah (C20)" },
      { label: "Tipe", value: "VRLA AGM" },
      { label: "Dimensi", value: "198 x 166 x 170 mm" },
      { label: "Berat", value: "13.5 kg" },
      { label: "Umur Layanan", value: "5-7 tahun" },
    ],
    images: ["/images/products/baterai-12v-45ah.jpg"],
    highlights: [
      "Cocok untuk UPS dan telekomunikasi",
      "Performa charge-discharge stabil",
      "Kompatibel untuk sistem solar off-grid",
    ],
    isHighlight: true,
    tags: ["baterai", "12v", "45ah", "vrla", "agm", "ups"],
    specificationMethod: "from-specs",
  },
  {
    id: "baterai-12v-100ah",
    name: "Baterai 12V 100Ah",
    slug: "baterai-12v-100ah",
    category: "baterai",
    subcategory: "baterai-12v",
    description:
      "Baterai 12V 100Ah deep cycle VRLA AGM yang dirancang untuk aplikasi berat termasuk sistem UPS besar, penyimpanan energi solar, dan backup power industri. Konstruksi grid tebal dan separator berkepadatan tinggi memastikan umur siklus yang panjang. Baterai ini mampu beroperasi pada suhu -15°C hingga 50°C dengan performa yang konsisten.",
    specifications: [
      { label: "Tegangan Nominal", value: "12V" },
      { label: "Kapasitas", value: "100Ah (C20)" },
      { label: "Tipe", value: "VRLA AGM Deep Cycle" },
      { label: "Dimensi", value: "331 x 173 x 222 mm" },
      { label: "Berat", value: "29.5 kg" },
      { label: "Umur Layanan", value: "7-10 tahun" },
    ],
    images: ["/images/products/baterai-12v-100ah.jpg"],
    highlights: [
      "Deep cycle untuk aplikasi berat",
      "Umur siklus panjang",
      "Operasi suhu lebar -15°C ~ 50°C",
      "Ideal untuk backup power industri",
    ],
    isHighlight: false,
    tags: ["baterai", "12v", "100ah", "deep-cycle", "vrla"],
    specificationMethod: "from-specs",
  },
  {
    id: "baterai-12v-200ah",
    name: "Baterai 12V 200Ah",
    slug: "baterai-12v-200ah",
    category: "baterai",
    subcategory: "baterai-12v",
    description:
      "Baterai 12V 200Ah deep cycle VRLA AGM dengan kapasitas besar untuk kebutuhan penyimpanan energi skala industri. Sangat cocok untuk data center, telekomunikasi, sistem energi terbarukan, dan backup power gedung bertingkat. Konstruksi anti gempa dan desain terminal ganda memudahkan instalasi paralel maupun seri.",
    specifications: [
      { label: "Tegangan Nominal", value: "12V" },
      { label: "Kapasitas", value: "200Ah (C20)" },
      { label: "Tipe", value: "VRLA AGM Deep Cycle" },
      { label: "Dimensi", value: "522 x 240 x 219 mm" },
      { label: "Berat", value: "60 kg" },
      { label: "Umur Layanan", value: "10-12 tahun" },
    ],
    images: ["/images/products/baterai-12v-200ah.jpg"],
    highlights: [
      "Kapasitas besar skala industri",
      "Terminal ganda untuk paralel/seri",
      "Konstruksi anti gempa",
      "Cocok untuk data center",
    ],
    isHighlight: false,
    tags: ["baterai", "12v", "200ah", "deep-cycle", "industri"],
    specificationMethod: "from-specs",
  },
  {
    id: "ups-1000va",
    name: "UPS 1000VA",
    slug: "ups-1000va",
    category: "baterai",
    subcategory: "ups",
    description:
      "UPS (Uninterruptible Power Supply) 1000VA dengan teknologi line-interactive untuk perlindungan perangkat elektronik dari gangguan listrik. Dilengkapi AVR (Automatic Voltage Regulator) yang menjaga stabilitas tegangan output. Cocok untuk komputer desktop, workstation, dan perangkat jaringan kecil.",
    specifications: [
      { label: "Kapasitas", value: "1000VA / 600W" },
      { label: "Tipe", value: "Line-Interactive" },
      { label: "Tegangan Input", value: "AC 140-300V" },
      { label: "Tegangan Output", value: "AC 220V ± 10%" },
      { label: "Waktu Backup", value: "5-15 menit (tergantung beban)" },
      { label: "Baterai Internal", value: "12V 7Ah × 2" },
    ],
    images: ["/images/products/ups-1000va.jpg"],
    highlights: [
      "AVR untuk stabilisasi tegangan",
      "Proteksi dari spike dan surge",
      "Cocok untuk komputer dan jaringan",
    ],
    isHighlight: false,
    tags: ["ups", "1000va", "line-interactive", "backup-power"],
    specificationMethod: "from-specs",
  },
  {
    id: "ups-2000va",
    name: "UPS 2000VA",
    slug: "ups-2000va",
    category: "baterai",
    subcategory: "ups",
    description:
      "UPS 2000VA online double-conversion untuk perlindungan kritis pada server, perangkat jaringan, dan sistem industri. Teknologi double-conversion memastikan output AC yang murni dan stabil tanpa jeda saat terjadi pemadaman listrik. Dilengkapi port USB dan slot SNMP untuk monitoring jarak jauh.",
    specifications: [
      { label: "Kapasitas", value: "2000VA / 1600W" },
      { label: "Tipe", value: "Online Double-Conversion" },
      { label: "Tegangan Input", value: "AC 110-300V" },
      { label: "Tegangan Output", value: "AC 220V ± 2%" },
      { label: "Waktu Backup", value: "8-25 menit (tergantung beban)" },
      { label: "Baterai Internal", value: "12V 9Ah × 4" },
    ],
    images: ["/images/products/ups-2000va.jpg"],
    highlights: [
      "Double-conversion output murni",
      "SNMP untuk monitoring jarak jauh",
      "Zero transfer time",
      "Ideal untuk server dan industri",
    ],
    isHighlight: false,
    tags: ["ups", "2000va", "online", "double-conversion", "server"],
    specificationMethod: "from-specs",
  },
  {
    id: "battery-charger-12v",
    name: "Battery Charger 12V",
    slug: "battery-charger-12v",
    category: "baterai",
    subcategory: "battery-charger",
    description:
      "Battery Charger 12V dengan teknologi pengisian cerdas (smart charging) untuk berbagai jenis baterai lead-acid termasuk VRLA, AGM, dan gel. Dilengkapi dengan 4 tahap pengisian (desulfation, bulk, absorption, float) untuk memaksimalkan umur baterai. Proteksi berlapis dari arus lebih, hubung singkat, dan polaritas terbalik.",
    specifications: [
      { label: "Tegangan Output", value: "12V DC" },
      { label: "Arus Pengisian", value: "10A / 20A" },
      { label: "Tipe Pengisian", value: "4-Stage Smart Charging" },
      { label: "Kompatibilitas", value: "VRLA, AGM, Gel" },
      { label: "Proteksi", value: "OVP, OCP, SCP, Reverse Polarity" },
      { label: "Display", value: "LCD Voltmeter & Amperemeter" },
    ],
    images: ["/images/products/battery-charger-12v.jpg"],
    highlights: [
      "Smart charging 4 tahap",
      "Proteksi berlapis",
      "LCD display volt & ampere",
    ],
    isHighlight: false,
    tags: ["battery-charger", "12v", "smart-charging", "lead-acid"],
    specificationMethod: "from-specs",
  },
  {
    id: "battery-charger-24v",
    name: "Battery Charger 24V",
    slug: "battery-charger-24v",
    category: "baterai",
    subcategory: "battery-charger",
    description:
      "Battery Charger 24V untuk sistem baterai seri yang umum digunakan pada UPS menengah, forklift, dan aplikasi industri. Microprocessor-controlled charging profile memastikan pengisian yang optimal untuk berbagai kapasitas baterai. Dilengkapi fitur equalization charge untuk menjaga keseimbangan sel baterai pada bank seri.",
    specifications: [
      { label: "Tegangan Output", value: "24V DC" },
      { label: "Arus Pengisian", value: "15A / 30A" },
      { label: "Tipe Pengisian", value: "Microprocessor Controlled" },
      { label: "Kompatibilitas", value: "VRLA, AGM, Gel, Flooded" },
      { label: "Proteksi", value: "OVP, OCP, SCP, Reverse Polarity, Over Temp" },
      { label: "Fitur Khusus", value: "Equalization Charge" },
    ],
    images: ["/images/products/battery-charger-24v.jpg"],
    highlights: [
      "Microprocessor-controlled charging",
      "Equalization charge untuk bank seri",
      "Proteksi suhu berlebih",
      "Ideal untuk forklift dan industri",
    ],
    isHighlight: false,
    tags: ["battery-charger", "24v", "industri", "forklift"],
    specificationMethod: "from-specs",
  },
];

export const articles: Article[] = [
  {
    id: "tips-memilih-baterai-tepat",
    title: "Tips Memilih Baterai yang Tepat untuk Kebutuhan Anda",
    slug: "tips-memilih-baterai-tepat",
    category: "baterai",
    excerpt:
      "Memilih baterai yang tepat tidak hanya soal kapasitas, tetapi juga jenis, tegangan, dan aplikasi penggunaannya. Pelajari cara memilih baterai yang sesuai dengan kebutuhan spesifik Anda.",
    content: `
Memilih baterai yang tepat tidak hanya soal kapasitas, tetapi juga jenis, tegangan, dan aplikasi penggunaannya. Kesalahan dalam memilih baterai dapat berakibat fatal pada performa sistem dan biaya operasional jangka panjang.

## Kenali Jenis Baterai

Terdapat beberapa jenis baterai yang umum digunakan di industri, masing-masing dengan kelebihan dan kekurangannya. Baterai VRLA AGM merupakan pilihan paling populer untuk aplikasi UPS karena bebas perawatan dan aman. Baterai gel menawarkan ketahanan suhu yang lebih baik, sementara baterai LiFePO4 memberikan umur siklus terpanjang meskipun investasi awalnya lebih tinggi.

## Sesuaikan Kapasitas dengan Beban

Kapasitas baterai harus disesuaikan dengan total beban yang akan didukung dan durasi backup yang diinginkan. Gunakan rumus sederhana: Kapasitas (Ah) = Total Beban (W) × Durasi Backup (jam) / Tegangan (V). Tambahkan margin 20-30% untuk menjaga baterai tidak bekerja pada kapasitas penuh secara terus menerus.

## Perhatikan Lingkungan Operasi

Suhu lingkungan sangat mempengaruhi performa dan umur baterai. Setiap kenaikan 8°C di atas 25°C akan mengurangi umur baterai lead-acid sekitar 50%. Pastikan ruang baterai memiliki ventilasi yang memadai dan sistem pendingin jika diperlukan.
    `,
    coverImage: "/images/articles/tips-memilih-baterai.jpg",
    tags: ["baterai", "tips", "pemilihan", "vrla"],
    readingTime: 6,
    isHighlight: true,
    publishedAt: "2024-11-10",
    author: "Tim Arostech",
  },
  {
    id: "perawatan-baterai-awet",
    title: "Perawatan Baterai agar Awet: Panduan Lengkap",
    slug: "perawatan-baterai-awet",
    category: "baterai",
    excerpt:
      "Perawatan baterai yang tepat dapat memperpanjang umur layanan hingga 2 kali lipat. Simak panduan lengkap perawatan baterai untuk berbagai jenis dan aplikasi.",
    content: `
Perawatan baterai yang tepat dapat memperpanjang umur layanan hingga 2 kali lipat. Banyak pengguna yang mengabaikan perawatan baterai hingga terjadi kegagalan mendadak yang berdampak serius pada operasional.

## Pemeriksaan Berkala

Lakukan pemeriksaan visual setiap bulan untuk mendeteksi tanda-tanda kerusakan dini seperti pembengkakan, kebocoran, atau korosi pada terminal. Untuk baterai flooded, periksa level elektrolit dan pastikan selalu antara batas upper dan lower. Bersihkan terminal dengan larutan baking soda jika terdapat korosi.

## Pengisian yang Benar

Hindari overcharging dan deep discharge yang berlebihan. Gunakan charger dengan profil pengisian yang sesuai dengan jenis baterai. Baterai VRLA AGM sebaiknya diisi pada tegangan float 13.5-13.8V per unit pada suhu 25°C. Untuk baterai deep cycle, jangan membiarkan Depth of Discharge (DoD) melebihi 80%.

## Lingkungan Penyimpanan

Simpan baterai di tempat yang sejuk, kering, dan berventilasi baik. Suhu ideal penyimpanan adalah 20-25°C. Hindari paparan sinar matahari langsung dan sumber panas. Baterai yang disimpan dalam jangka waktu lama harus diisi ulang setiap 3 bulan untuk mencegah sulfasi.
    `,
    coverImage: "/images/articles/perawatan-baterai.jpg",
    tags: ["baterai", "perawatan", "perpanjangan-umur", "vrla"],
    readingTime: 7,
    isHighlight: false,
    publishedAt: "2024-10-15",
    author: "Tim Arostech",
  },
  {
    id: "perbandingan-jenis-baterai",
    title: "Perbandingan Jenis Baterai: AGM, Gel, dan LiFePO4",
    slug: "perbandingan-jenis-baterai",
    category: "baterai",
    excerpt:
      "Memahami perbedaan antara baterai AGM, Gel, dan LiFePO4 sangat penting untuk memilih solusi penyimpanan energi yang paling sesuai dengan kebutuhan dan anggaran Anda.",
    content: `
Memahami perbedaan antara baterai AGM, Gel, dan LiFePO4 sangat penting untuk memilih solusi penyimpanan energi yang paling sesuai dengan kebutuhan dan anggaran Anda. Masing-masing teknologi memiliki karakteristik unik yang cocok untuk aplikasi berbeda.

## Baterai AGM (Absorbent Glass Mat)

Baterai AGM menggunakan separator fiber glass yang menyerap elektrolit, menjadikannya bebas tumpah dan dapat dipasang dalam berbagai posisi. Kelebihan utamanya adalah harga yang kompetitif, self-discharge rendah, dan kemampuan pengisian cepat. Umur siklus biasanya 300-500 siklus pada 80% DoD. Cocok untuk aplikasi UPS standby dan sistem keamanan.

## Baterai Gel

Baterai Gel menggunakan elektrolit dalam bentuk gel yang memberikan ketahanan lebih baik terhadap getaran dan suhu ekstrem. Kelebihannya adalah umur siklus yang lebih panjang (500-800 siklus) dan performa yang lebih stabil pada suhu tinggi. Namun, baterai gel memerlukan pengisian yang lebih lambat dan profil tegangan yang lebih presisi.

## Baterai LiFePO4

Baterai LiFePO4 (Lithium Iron Phosphate) merupakan teknologi terbaru dengan keunggulan umur siklus terpanjang (2000-5000 siklus), densitas energi tertinggi, dan berat paling ringan. Meskipun investasi awal 3-4 kali lebih tinggi dari AGM, total biaya kepemilikan (TCO) jauh lebih rendah dalam jangka panjang. Cocok untuk sistem solar dan aplikasi deep cycle berat.
    `,
    coverImage: "/images/articles/perbandingan-baterai.jpg",
    tags: ["baterai", "agm", "gel", "lifepo4", "perbandingan"],
    readingTime: 8,
    isHighlight: false,
    publishedAt: "2024-09-20",
    author: "Tim Arostech",
  },
];

export const companyInfo: CompanyInfo = {
  category: "baterai",
  companyName: "Arostech",
  companyDescription:
    "Arostech adalah penyedia solusi baterai dan penyimpanan energi terkemuka di Indonesia. Dengan pengalaman lebih dari 15 tahun, kami menyediakan baterai VRLA, UPS, dan battery charger berkualitas tinggi untuk berbagai kebutuhan industri, komersial, dan infrastruktur. Produk kami telah memenuhi standar SNI dan didukung oleh tim teknis profesional yang siap melayani di seluruh Indonesia.",
  vision:
    "Menjadi penyedia solusi baterai dan penyimpanan energi terdepan di Indonesia yang inovatif, andal, dan berkelanjutan.",
  mission: [
    "Menyediakan baterai dan sistem penyimpanan energi berkualitas tinggi yang memenuhi standar nasional dan internasional",
    "Menghadirkan solusi UPS dan backup power yang andal untuk mendukung kelangsungan operasional klien",
    "Memberikan konsultasi teknis dan layanan purna jual profesional untuk setiap kebutuhan baterai",
    "Mendorong adopsi teknologi baterai ramah lingkungan dan efisien untuk mendukung energi berkelanjutan",
    "Membangun kemitraan jangka panjang dengan instansi pemerintah, BUMN, dan perusahaan swasta",
  ],
  certifications: [
    {
      name: "SNI",
      description:
        "Standar Nasional Indonesia - Produk baterai memenuhi standar keselamatan dan kinerja nasional",
    },
    {
      name: "TKDN",
      description:
        "Tingkat Komponen Dalam Negeri - Mengutamakan komponen produksi dalam negeri",
    },
  ],
  contactEmail: "info@dayaberkah.id",
  contactPhone: "+62 822-3026-1340",
  whatsappNumber: "6282230261340",
  address:
    "Komplek pergudangan dan, Jl. Industri Kencana Trosobo Jl. Raya Trosobo No.KM 23, Sidorogo, Trosobo, Kec. Taman, Kabupaten Sidoarjo, Jawa Timur 61257",
  workingHours: "Senin – Jumat: 08.00 – 17.00 WIB",
  stats: {
    projectsCompleted: 350,
    yearsExperience: 15,
    citiesCovered: 25,
  },
};

export const projects: Project[] = [
  {
    id: "ups-data-center-surabaya",
    title: "Instalasi UPS & Baterai Backup Data Center Surabaya",
    slug: "ups-data-center-surabaya",
    category: "baterai",
    client: "PT Data Center Surabaya",
    location: "Surabaya, Jawa Timur",
    year: 2024,
    description:
      "Proyek penyediaan dan instalasi sistem UPS serta bank baterai untuk data center dengan kapasitas 200kVA. Sistem dirancang untuk memberikan backup power selama 30 menit pada beban penuh, memastikan kelangsungan operasional data center saat terjadi pemadaman listrik PLN.",
    scope: [
      "Analisis kebutuhan dan desain sistem backup power",
      "Pengadaan UPS 200kVA online double-conversion",
      "Pengadaan 64 unit baterai 12V 100Ah",
      "Instalasi rack baterai dan wiring",
      "Commissioning dan load testing",
    ],
    results: [
      "Backup power 30 menit pada beban penuh",
      "Zero downtime saat pemadaman listrik",
      "Monitoring baterai real-time",
      "Umur baterai diperkirakan 8-10 tahun",
    ],
    productCategory: "UPS & Baterai",
    projectScale: "Besar",
    duration: "3 bulan",
    coverImage: "/images/projects/ups-data-center.jpg",
    isHighlight: true,
    tags: ["ups", "baterai", "data-center", "backup-power"],
  },
  {
    id: "baterai-solar-panel-ntt",
    title: "Penyediaan Baterai untuk Sistem Solar Panel Off-Grid NTT",
    slug: "baterai-solar-panel-ntt",
    category: "baterai",
    client: "Pemerintah Kabupaten Rote Ndao",
    location: "Rote Ndao, NTT",
    year: 2024,
    description:
      "Proyek penyediaan bank baterai 48V 400Ah untuk sistem solar panel off-grid yang melayani 3 desa terpencil di Kabupaten Rote Ndao. Sistem menyediakan listrik 24 jam untuk penerangan rumah tangga, fasilitas kesehatan, dan sekolah.",
    scope: [
      "Survey dan analisis kebutuhan energi",
      "Pengadaan 16 unit baterai 12V 200Ah deep cycle",
      "Pembuatan rack baterai anti gempa",
      "Instalasi dan integrasi dengan solar charge controller",
      "Pelatihan teknisi desa",
    ],
    results: [
      "Listrik 24 jam untuk 120+ rumah tangga",
      "0% biaya operasional energi",
      "Bank baterai berumur 10+ tahun",
      "Mendukung aktivitas ekonomi dan pendidikan malam hari",
    ],
    productCategory: "Baterai Deep Cycle",
    projectScale: "Menengah",
    duration: "2 bulan",
    coverImage: "/images/projects/baterai-solar-ntt.jpg",
    isHighlight: true,
    tags: ["baterai", "deep-cycle", "solar", "off-grid", "ntt"],
  },
  {
    id: "battery-charger-industri-gresik",
    title: "Sistem Battery Charger untuk Forklift Pabrik Gresik",
    slug: "battery-charger-industri-gresik",
    category: "baterai",
    client: "PT Semen Gresik Industri",
    location: "Gresik, Jawa Timur",
    year: 2023,
    description:
      "Proyek penyediaan battery charger 24V 30A untuk armada forklift di pabrik semen. Sistem dilengkapi dengan fitur equalization charge dan monitoring individual untuk setiap unit forklift. Dirancang untuk mengoptimalkan umur baterai forklift dan mengurangi downtime operasional.",
    scope: [
      "Audit kondisi baterai forklift eksisting",
      "Pengadaan 12 unit battery charger 24V 30A",
      "Instalasi charging station terpusat",
      "Integrasi monitoring system",
      "Pelatihan operator pengisian",
    ],
    results: [
      "Pengurangan downtime forklift 40%",
      "Peningkatan umur baterai rata-rata 35%",
      "Monitoring pengisian real-time",
      "Penghematan biaya penggantian baterai 30% per tahun",
    ],
    productCategory: "Battery Charger",
    projectScale: "Menengah",
    duration: "1.5 bulan",
    coverImage: "/images/projects/battery-charger-gresik.jpg",
    isHighlight: false,
    tags: ["battery-charger", "forklift", "industri", "24v"],
  },
];
