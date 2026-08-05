/**
 * Clean + Populate Sanity Studio — One-shot script
 *
 * This script:
 * 1. Deletes ALL existing documents (products, articles, portfolio, companyInfo, spokeConfig)
 * 2. Re-creates spokeConfig documents
 * 3. Re-creates content documents with subdomain-prefixed IDs
 *    (e.g. "pju-product-pju-led-100w" instead of "product-pju-led-100w")
 *    This ensures zero collision risk between spokes.
 *
 * Run: npx tsx scripts/clean-and-populate-sanity.ts
 */

const SANITY_PROJECT_ID = "3h4k8dye";
const SANITY_DATASET = "production";
const SANITY_TOKEN = process.env.SANITY_API_WRITE_TOKEN || "";
const API_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/${SANITY_DATASET}`;
const QUERY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/query/${SANITY_DATASET}`;

if (!SANITY_TOKEN) {
  console.error("ERROR: SANITY_API_WRITE_TOKEN not set");
  process.exit(1);
}

// ============================================================================
// SPOKE CONFIG DATA
// ============================================================================

const spokeConfigs = [
  {
    _id: "spoke-config-pju",
    _type: "spokeConfig",
    name: "Arostech PJU",
    subdomain: "pju",
    tagline: "Solusi Penerangan Jalan Umum Terpercaya",
    primaryColor: "#10b981",
    heroBadge: "Solusi PJU Terpercaya #1 di Indonesia",
    heroTitle: "Solusi Penerangan Jalan Umum Terpercaya",
    heroDescription:
      "Menyediakan produk PJU LED, PJU Tenaga Surya, dan Smart PJU berkualitas tinggi bersertifikasi SNI dan TKDN untuk kebutuhan penerangan jalan di seluruh Indonesia.",
    seoDefaults: {
      title: "Arostech PJU - Solusi Penerangan Jalan Umum",
      description:
        "Penyedia solusi PJU terpercaya di Indonesia. PJU LED, PJU Tenaga Surya, dan Smart PJU bersertifikasi.",
    },
    footerProductLinks: [
      { label: "PJU LED", href: "/products?category=pju-led", _key: "pju-led-1" },
      { label: "PJU Tenaga Surya", href: "/products?category=pju-tenaga-surya", _key: "pju-ts-1" },
      { label: "Smart PJU", href: "/products?category=smart-pju", _key: "smart-pju-1" },
    ],
  },
  {
    _id: "spoke-config-baterai",
    _type: "spokeConfig",
    name: "Arostech Baterai",
    subdomain: "baterai",
    tagline: "Solusi Baterai & Penyimpanan Energi Terpercaya",
    primaryColor: "#10b981",
    heroBadge: "Solusi Baterai & Energi Terpercaya #1",
    heroTitle: "Solusi Baterai & Penyimpanan Energi",
    heroDescription:
      "Menyediakan baterai 12V, UPS, dan Battery Charger berkualitas tinggi untuk kebutuhan industri, komersial, dan rumah tangga di seluruh Indonesia.",
    seoDefaults: {
      title: "Arostech Baterai - Solusi Baterai & Penyimpanan Energi",
      description:
        "Penyedia solusi baterai terpercaya di Indonesia. Baterai 12V, UPS, dan Battery Charger berkualitas.",
    },
    footerProductLinks: [
      { label: "Baterai 12V", href: "/products?category=baterai-12v", _key: "bat-12v-1" },
      { label: "UPS", href: "/products?category=ups", _key: "ups-1" },
      { label: "Battery Charger", href: "/products?category=battery-charger", _key: "bc-1" },
    ],
  },
  {
    _id: "spoke-config-solarpanel",
    _type: "spokeConfig",
    name: "Arostech Solar Panel",
    subdomain: "solarpanel",
    tagline: "Solusi Panel Surya & Energi Terbarukan Terpercaya",
    primaryColor: "#10b981",
    heroBadge: "Solusi Energi Surya Terpercaya #1",
    heroTitle: "Solusi Panel Surya & Energi Terbarukan",
    heroDescription:
      "Menyediakan solar panel 5WP hingga 550WP berkualitas tinggi bersertifikasi IEC untuk kebutuhan pembangkit listrik tenaga surya di seluruh Indonesia.",
    seoDefaults: {
      title: "Arostech Solar Panel - Solusi Panel Surya & Energi Terbarukan",
      description:
        "Penyedia solusi solar panel terpercaya di Indonesia. Solar panel 5WP hingga 550WP bersertifikasi IEC.",
    },
    footerProductLinks: [
      { label: "Solar Panel 5WP-100WP", href: "/products?category=solarpanel-kecil", _key: "sp-k-1" },
      { label: "Solar Panel 100WP-550WP", href: "/products?category=solarpanel-besar", _key: "sp-b-1" },
    ],
  },
  {
    _id: "spoke-config-penangkalpetir",
    _type: "spokeConfig",
    name: "Arostech Penangkal Petir",
    subdomain: "penangkalpetir",
    tagline: "Solusi Penangkal Petir & Proteksi Kilat Terpercaya",
    primaryColor: "#10b981",
    heroBadge: "Solusi Proteksi Petir Terpercaya #1",
    heroTitle: "Solusi Penangkal Petir & Proteksi Kilat",
    heroDescription:
      "Menyediakan penangkal petir Kurn, Viking, Erico, LPI Guardian, Thomas, dan EF berkualitas tinggi bersertifikasi NFC 17-102 untuk kebutuhan proteksi kilat di seluruh Indonesia.",
    seoDefaults: {
      title: "Arostech Penangkal Petir - Solusi Proteksi Kilat",
      description:
        "Penyedia solusi penangkal petir terpercaya di Indonesia. Penangkal petir ESE bersertifikasi NFC 17-102.",
    },
    footerProductLinks: [
      { label: "Kurn", href: "/products?category=kurn", _key: "kurn-1" },
      { label: "Viking", href: "/products?category=viking", _key: "viking-1" },
      { label: "Erico", href: "/products?category=erico", _key: "erico-1" },
      { label: "LPI Guardian", href: "/products?category=lpi-guardian", _key: "lpi-1" },
      { label: "Thomas", href: "/products?category=thomas", _key: "thomas-1" },
      { label: "EF", href: "/products?category=ef", _key: "ef-1" },
    ],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function sanityQuery(query: string) {
  const res = await fetch(`${QUERY_URL}?query=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${SANITY_TOKEN}` },
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Query error (${res.status}): ${text}`);
    return { result: [] };
  }
  return res.json();
}

async function sanityMutate(mutations: object[]) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SANITY_TOKEN}`,
    },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Mutate error (${res.status}): ${text}`);
    return null;
  }
  return res.json();
}

// ============================================================================
// INLINE DATA — Duplicated from src/data/*.ts to avoid import issues
// ============================================================================

// --- PJU Products ---
const pjuProducts = [
  { name: "PJU LED 100W", slug: "pju-led-100w", category: "pju", subcategory: "pju-led", description: "Lampu PJU LED 100W daya tinggi untuk penerangan jalan utama dan kawasan industri. Menggunakan chip LED premium dengan luminous efficacy di atas 160 lm/W, menghasilkan cahaya terang merata dengan konsumsi daya rendah. Housing die-cast aluminium dengan IP66 protection menjamin ketahanan di segala cuaca.", specifications: [{ label: "Daya", value: "100W" }, { label: "Lumen", value: "16.000 lm" }, { label: "Warna Cahaya", value: "5000-6500K (Daylight)" }, { label: "IP Rating", value: "IP66" }, { label: "Tegangan", value: "AC 85-265V" }, { label: "Umur", value: ">50.000 jam" }], highlights: ["Luminous efficacy >160 lm/W", "IP66 weatherproof", "Garansi 3 tahun"], isHighlight: true, tags: ["pju", "led", "100w"] },
  { name: "PJU LED 200W", slug: "pju-led-200w", category: "pju", subcategory: "pju-led", description: "Lampu PJU LED 200W untuk penerangan jalan tol, highway, dan area luas. Dilengkapi dengan sistem pendingin aktif dan lensa optik presisi untuk distribusi cahaya tipe III yang optimal pada jalan lebar.", specifications: [{ label: "Daya", value: "200W" }, { label: "Lumen", value: "32.000 lm" }, { label: "Warna Cahaya", value: "4000-5000K (Neutral White)" }, { label: "IP Rating", value: "IP66" }, { label: "Tegangan", value: "AC 85-265V" }, { label: "Dimensi", value: "580 x 310 x 120 mm" }], highlights: ["Cahaya ultra-terang untuk jalan tol", "Sistem pendingin aktif", "Distribusi cahaya tipe III"], isHighlight: true, tags: ["pju", "led", "200w"] },
  { name: "PJU LED 40W", slug: "pju-led-40w", category: "pju", subcategory: "pju-led", description: "Lampu PJU LED 40W hemat energi untuk penerangan jalan lingkungan, gang, dan area perumahan. Desain kompak dengan bobot ringan memudahkan instalasi pada tiang existing tanpa perlu modifikasi bracket.", specifications: [{ label: "Daya", value: "40W" }, { label: "Lumen", value: "5.600 lm" }, { label: "Warna Cahaya", value: "5000-6500K (Daylight)" }, { label: "IP Rating", value: "IP65" }, { label: "Tegangan", value: "AC 85-265V" }, { label: "Berat", value: "1.8 kg" }], highlights: ["Hemat energi hingga 70%", "Desain kompak ringan", "Instalasi mudah pada tiang existing"], isHighlight: false, tags: ["pju", "led", "40w"] },
  { name: "PJU Tenaga Surya All-in-One", slug: "pju-surya-all-in-one", category: "pju", subcategory: "pju-tenaga-surya", description: "PJU Tenaga Surya tipe All-in-One yang mengintegrasikan solar panel, baterai LiFePO4, dan lampu LED dalam satu unit. Ideal untuk lokasi tanpa akses jaringan PLN. Dilengkapi sensor motion dan photocell untuk efisiensi energi optimal.", specifications: [{ label: "Daya LED", value: "40W" }, { label: "Solar Panel", value: "60W Polycrystalline" }, { label: "Baterai", value: "LiFePO4 25.6V 30Ah" }, { label: "Backup", value: "3 hari hujan berturut-turut" }, { label: "Sensor", value: "Motion + Photocell" }, { label: "IP Rating", value: "IP65" }], highlights: ["Tanpa kabel PLN — 100% solar", "Baterai LiFePO4 tahan lama", "Sensor motion otomatis"], isHighlight: true, tags: ["pju", "surya", "all-in-one", "solar"] },
  { name: "PJU Tenaga Surya Split", slug: "pju-surya-split", category: "pju", subcategory: "pju-tenaga-surya", description: "PJU Tenaga Surya tipe Split dengan komponen terpisah (solar panel, controller, baterai, lampu) untuk fleksibilitas instalasi yang lebih tinggi. Cocok untuk proyek skala besar dan kebutuhan penerangan dengan spesifikasi khusus.", specifications: [{ label: "Daya LED", value: "60W" }, { label: "Solar Panel", value: "100W Mono/Poly" }, { label: "Baterai", value: "VRLA 12V 100Ah" }, { label: "Controller", value: "MPPT 20A" }, { label: "Backup", value: "2-3 hari" }, { label: "Tinggi Tiang", value: "6-8 meter" }], highlights: ["Fleksibilitas tinggi — komponen terpisah", "Controller MPPT efisiensi maksimal", "Ideal proyek skala besar"], isHighlight: false, tags: ["pju", "surya", "split", "solar"] },
  { name: "Smart PJU IoT", slug: "smart-pju-iot", category: "pju", subcategory: "smart-pju", description: "Smart PJU berbasis IoT dengan kemampuan monitoring dan kontrol jarak jauh melalui platform cloud. Dilengkapi sensor cahaya, motion, dan komunikasi LoRa/NB-IoT untuk manajemen penerangan cerdas.", specifications: [{ label: "Daya LED", value: "60W" }, { label: "Konektivitas", value: "LoRa / NB-IoT" }, { label: "Platform", value: "Cloud Dashboard" }, { label: "Sensor", value: "Photocell + Motion" }, { label: "Dimming", value: "0-100% remote" }, { label: "Proteksi", value: "Surge + Overvoltage" }], highlights: ["Monitoring real-time via dashboard", "Kontrol dimming jarak jauh", "Notifikasi otomatis saat gangguan"], isHighlight: true, tags: ["pju", "smart", "iot", "monitoring"] },
];

// --- PJU Articles ---
const pjuArticles = [
  { title: "Panduan Memilih PJU LED yang Tepat", slug: "panduan-memilih-pju-led", category: "pju", excerpt: "Tips dan panduan lengkap memilih lampu PJU LED sesuai kebutuhan penerangan jalan di lingkungan Anda.", content: "Memilih PJU LED yang tepat memerlukan pertimbangan matang terhadap beberapa faktor kunci. Pertama, tentukan luas area yang ingin diterangi dan tinggi tiang yang tersedia. Kedua, perhatikan spesifikasi lumen dan sudut pancaran cahaya. Ketiga, pastikan produk memiliki sertifikasi SNI dan IP rating yang sesuai untuk ketahanan cuaca tropis Indonesia. Keempat, pertimbangkan garansi dan ketersediaan layanan purna jual di wilayah Anda.", tags: ["pju", "led", "panduan"], isHighlight: true },
  { title: "Keunggulan PJU Tenaga Surya untuk Daerah Terpencil", slug: "keunggulan-pju-tenaga-surya", category: "pju", excerpt: "Mengapa PJU tenaga surya menjadi solusi ideal untuk penerangan di daerah terpencil yang belum terjangkau PLN.", content: "PJU tenaga surya menawarkan solusi mandiri tanpa ketergantungan pada jaringan listrik PLN. Untuk daerah terpencil, ini berarti penerangan jalan bisa diwujudkan tanpa biaya instalasi kabel yang mahal. Baterai LiFePO4 modern mampu menyimpan energi untuk 2-3 hari tanpa sinar matahari, menjaga penerangan tetap berjalan bahkan saat musim hujan.", tags: ["pju", "surya", "daerah-terpencil"], isHighlight: false },
  { title: "Smart PJU: Masa Depan Penerangan Jalan Cerdas", slug: "smart-pju-masa-depan", category: "pju", excerpt: "Bagaimana teknologi IoT mengubah sistem penerangan jalan umum menjadi lebih efisien dan mudah dikelola.", content: "Smart PJU mengintegrasikan sensor, konektivitas IoT, dan analitik data untuk mengoptimalkan penerangan jalan. Sistem ini memungkinkan kontrol dimming jarak jauh, monitoring konsumsi energi real-time, dan notifikasi otomatis saat terjadi gangguan. Bagi pengelola kota, ini berarti penghematan energi hingga 40% dan pengurangan waktu respons terhadap kerusakan.", tags: ["pju", "smart", "iot"], isHighlight: true },
  { title: "Standar SNI untuk PJU LED di Indonesia", slug: "standar-sni-pju-led", category: "pju", excerpt: "Memahami persyaratan standar SNI yang harus dipenuhi produk PJU LED untuk digunakan di Indonesia.", content: "Standar Nasional Indonesia (SNI) untuk PJU LED mencakup persyaratan keselamatan, performa, dan EMC. SNI IEC 60598-2-3 mengatur keamanan lampu jalan, sementara SNI IEC 62722-2-1 mengatur performa. Produk yang telah memenuhi SNI menjamin kualitas, keamanan, dan daya tahan yang terstandarisasi.", tags: ["pju", "sni", "regulasi"], isHighlight: false },
];

// --- PJU Portfolio ---
const pjuProjects = [
  { title: "Penerangan Jalan Tol Trans Jawa", slug: "pju-tol-trans-jawa", category: "pju", clientName: "PT Jasa Marga", location: "Jawa Tengah", description: "Instalasi 1.200 unit PJU LED 200W sepanjang ruas tol Trans Jawa untuk penerangan yang aman dan efisien.", completionYear: 2024, isHighlight: true },
  { title: "PJU Solar All-in-One Desa NTT", slug: "pju-solar-desa-ntt", category: "pju", clientName: "Pemerintah Kabupaten Sumba Timur", location: "NTT", description: "Pemasangan 350 unit PJU tenaga surya all-in-one untuk 7 desa terpencil yang belum terjangkau jaringan PLN.", completionYear: 2024, isHighlight: true },
  { title: "Smart PJU Kota Surabaya", slug: "smart-pju-surabaya", category: "pju", clientName: "Dinas Perhubungan Kota Surabaya", location: "Surabaya", description: "Implementasi 500 unit Smart PJU IoT dengan sistem monitoring terpusat untuk penerangan jalan cerdas di Kota Surabaya.", completionYear: 2023, isHighlight: true },
  { title: "PJU LED Perumahan Jakarta Timur", slug: "pju-perumahan-jaktim", category: "pju", clientName: "PT Graha Sentosa", location: "Jakarta Timur", description: "Instalasi 200 unit PJU LED 40W untuk penerangan jalan perumahan cluster dengan garansi 3 tahun.", completionYear: 2023, isHighlight: false },
  { title: "PJU Tenaga Surya Pelabuhan Makassar", slug: "pju-pelabuhan-makassar", category: "pju", clientName: "PT Pelindo", location: "Makassar", description: "Pemasangan 150 unit PJU tenaga surya split type untuk area pelabuhan dengan ketahanan air laut.", completionYear: 2023, isHighlight: false },
  { title: "PJU LED Kawasan Industri Gresik", slug: "pju-industri-gresik", category: "pju", clientName: "Kawasan Industri Gresik", location: "Gresik", description: "Instalasi 400 unit PJU LED 100W untuk penerangan jalan utama kawasan industri dengan standar TKDN 40%.", completionYear: 2022, isHighlight: false },
];

// --- Baterai Products ---
const bateraiProducts = [
  { name: "Baterai 12V 5Ah", slug: "baterai-12v-5ah", category: "baterai", subcategory: "baterai-12v", description: "Baterai 12V 5Ah VRLA AGM untuk UPS kecil, alarm keamanan, dan perangkat elektronik darurat.", specifications: [{ label: "Tegangan", value: "12V" }, { label: "Kapasitas", value: "5Ah" }, { label: "Tipe", value: "VRLA AGM" }, { label: "Dimensi", value: "90x70x107mm" }, { label: "Berat", value: "1.5 kg" }], highlights: ["Bebas perawatan", "Teknologi AGM anti tumpah"], isHighlight: true, tags: ["baterai", "12v", "5ah"] },
  { name: "Baterai 12V 20Ah", slug: "baterai-12v-20ah", category: "baterai", subcategory: "baterai-12v", description: "Baterai 12V 20Ah VRLA AGM untuk UPS menengah dan sistem keamanan.", specifications: [{ label: "Tegangan", value: "12V" }, { label: "Kapasitas", value: "20Ah" }, { label: "Tipe", value: "VRLA AGM" }, { label: "Dimensi", value: "181x76x167mm" }, { label: "Berat", value: "5.8 kg" }], highlights: ["Kapasitas menengah serbaguna", "Terminal F2 standar industri"], isHighlight: true, tags: ["baterai", "12v", "20ah"] },
  { name: "Baterai 12V 45Ah", slug: "baterai-12v-45ah", category: "baterai", subcategory: "baterai-12v", description: "Baterai 12V 45Ah VRLA AGM untuk UPS besar dan sistem solar panel.", specifications: [{ label: "Tegangan", value: "12V" }, { label: "Kapasitas", value: "45Ah" }, { label: "Tipe", value: "VRLA AGM" }, { label: "Dimensi", value: "198x166x170mm" }, { label: "Berat", value: "13.5 kg" }], highlights: ["Ideal untuk UPS dan solar", "Umur layanan 5-8 tahun"], isHighlight: true, tags: ["baterai", "12v", "45ah"] },
  { name: "Baterai 12V 100Ah", slug: "baterai-12v-100ah", category: "baterai", subcategory: "baterai-12v", description: "Baterai 12V 100Ah deep cycle untuk sistem solar panel dan inverter.", specifications: [{ label: "Tegangan", value: "12V" }, { label: "Kapasitas", value: "100Ah" }, { label: "Tipe", value: "Deep Cycle AGM" }, { label: "Dimensi", value: "330x173x222mm" }, { label: "Berat", value: "30 kg" }], highlights: ["Deep cycle untuk solar", "Kapasitas besar"], isHighlight: false, tags: ["baterai", "12v", "100ah"] },
  { name: "Baterai 12V 200Ah", slug: "baterai-12v-200ah", category: "baterai", subcategory: "baterai-12v", description: "Baterai 12V 200Ah deep cycle untuk bank energi besar dan sistem off-grid.", specifications: [{ label: "Tegangan", value: "12V" }, { label: "Kapasitas", value: "200Ah" }, { label: "Tipe", value: "Deep Cycle AGM" }, { label: "Dimensi", value: "522x240x219mm" }, { label: "Berat", value: "57 kg" }], highlights: ["Kapasitas ekstra besar", "Ideal untuk off-grid"], isHighlight: false, tags: ["baterai", "12v", "200ah"] },
  { name: "UPS 1000VA", slug: "ups-1000va", category: "baterai", subcategory: "ups", description: "UPS Online 1000VA untuk perlindungan server dan peralatan IT kritis.", specifications: [{ label: "Kapasitas", value: "1000VA / 800W" }, { label: "Tipe", value: "Online Double Conversion" }, { label: "Backup", value: "10-15 menit" }, { label: "Output", value: "Pure Sine Wave" }], highlights: ["Online double conversion", "Pure sine wave output"], isHighlight: true, tags: ["ups", "1000va"] },
  { name: "UPS 2000VA", slug: "ups-2000va", category: "baterai", subcategory: "ups", description: "UPS Online 2000VA untuk data center kecil dan peralatan server.", specifications: [{ label: "Kapasitas", value: "2000VA / 1600W" }, { label: "Tipe", value: "Online Double Conversion" }, { label: "Backup", value: "15-20 menit" }, { label: "Output", value: "Pure Sine Wave" }], highlights: ["Ideal untuk data center kecil", "LCD display informatif"], isHighlight: false, tags: ["ups", "2000va"] },
  { name: "Battery Charger 12V", slug: "battery-charger-12v", category: "baterai", subcategory: "battery-charger", description: "Battery Charger 12V microprocessor untuk charging baterai VRLA/AGM.", specifications: [{ label: "Tegangan", value: "12V" }, { label: "Arus", value: "10A" }, { label: "Tipe", value: "Microprocessor Controlled" }, { label: "Kompatibel", value: "VRLA / AGM / Gel" }], highlights: ["Microprocessor controlled", "Multi-stage charging"], isHighlight: false, tags: ["charger", "12v"] },
  { name: "Battery Charger 24V", slug: "battery-charger-24v", category: "baterai", subcategory: "battery-charger", description: "Battery Charger 24V untuk sistem baterai seri di industri.", specifications: [{ label: "Tegangan", value: "24V" }, { label: "Arus", value: "15A" }, { label: "Tipe", value: "Microprocessor Controlled" }, { label: "Kompatibel", value: "VRLA / AGM / Gel" }], highlights: ["Untuk sistem 24V", "Proteksi overcharge"], isHighlight: false, tags: ["charger", "24v"] },
];

// --- Baterai Articles ---
const bateraiArticles = [
  { title: "Tips Memilih Baterai yang Tepat", slug: "tips-memilih-baterai-tepat", category: "baterai", excerpt: "Panduan memilih baterai sesuai kebutuhan aplikasi Anda.", content: "Memilih baterai yang tepat memerlukan pertimbangan terhadap tegangan, kapasitas, tipe, dan aplikasi penggunaan. Baterai VRLA AGM cocok untuk UPS dan standby, sementara deep cycle lebih tepat untuk solar panel. Perhatikan juga suhu operasi dan metode charging yang sesuai.", tags: ["baterai", "tips", "panduan"], isHighlight: true },
  { title: "Perawatan Baterai Agar Awet", slug: "perawatan-baterai-awet", category: "baterai", excerpt: "Cara merawat baterai agar umur layanan lebih panjang.", content: "Perawatan baterai yang tepat dapat memperpanjang umur layanan hingga 2x. Pastikan suhu operasi tidak melebihi 25 derajat Celcius, hindari pengosongan mendalam, dan gunakan charger yang sesuai. Untuk baterai VRLA AGM, pastikan terminal bersih dan kencang.", tags: ["baterai", "perawatan"], isHighlight: false },
  { title: "Perbandingan Jenis Baterai", slug: "perbandingan-jenis-baterai", category: "baterai", excerpt: "Perbandingan baterai VRLA AGM, Gel, dan LiFePO4.", content: "Baterai VRLA AGM menawarkan harga terjangkau dan bebas perawatan. Baterai Gel lebih tahan terhadap suhu tinggi dan getaran. Baterai LiFePO4 memiliki densitas energi tertinggi dan umur terpanjang namun harga lebih tinggi. Pilih berdasarkan kebutuhan dan budget Anda.", tags: ["baterai", "perbandingan"], isHighlight: true },
];

// --- Baterai Portfolio ---
const bateraiProjects = [
  { title: "UPS Data Center Surabaya", slug: "ups-data-center-surabaya", category: "baterai", clientName: "PT Data Utama", location: "Surabaya", description: "Instalasi sistem UPS modular untuk data center dengan total kapasitas 100kVA.", completionYear: 2024, isHighlight: true },
  { title: "Baterai Solar Panel NTT", slug: "baterai-solar-panel-ntt", category: "baterai", clientName: "PLN NTT", location: "Kupang", description: "Supply baterai deep cycle 200Ah untuk sistem solar panel off-grid 7 desa.", completionYear: 2024, isHighlight: true },
  { title: "Battery Charger Industri Gresik", slug: "battery-charger-industri-gresik", category: "baterai", clientName: "PT Petrokimia Gresik", location: "Gresik", description: "Instalasi 50 unit battery charger untuk sistem backup pabrik petrokimia.", completionYear: 2023, isHighlight: false },
];

// --- Solar Panel Products ---
const solarProducts = [
  { name: "Solar Panel 5WP", slug: "solarpanel-5wp", category: "solarpanel", subcategory: "solarpanel-kecil", description: "Solar panel 5WP untuk penerangan kecil dan charging gadget.", specifications: [{ label: "Daya", value: "5WP" }, { label: "Tipe", value: "Polycrystalline" }, { label: "Voc", value: "21.6V" }, { label: "Isc", value: "0.33A" }, { label: "Dimensi", value: "250x200x17mm" }], highlights: ["Kecil dan ringan", "Cocok untuk penerangan"], isHighlight: true, tags: ["solar", "5wp"] },
  { name: "Solar Panel 20WP", slug: "solarpanel-20wp", category: "solarpanel", subcategory: "solarpanel-kecil", description: "Solar panel 20WP untuk penerangan rumah dan charging baterai kecil.", specifications: [{ label: "Daya", value: "20WP" }, { label: "Tipe", value: "Polycrystalline" }, { label: "Voc", value: "21.6V" }, { label: "Isc", value: "1.23A" }, { label: "Dimensi", value: "440x350x25mm" }], highlights: ["Ideal untuk rumah tangga", "Harga terjangkau"], isHighlight: false, tags: ["solar", "20wp"] },
  { name: "Solar Panel 50WP", slug: "solarpanel-50wp", category: "solarpanel", subcategory: "solarpanel-kecil", description: "Solar panel 50WP monocrystalline untuk sistem kecil menengah.", specifications: [{ label: "Daya", value: "50WP" }, { label: "Tipe", value: "Monocrystalline" }, { label: "Efficiency", value: "20.5%" }, { label: "Dimensi", value: "670x510x30mm" }], highlights: ["Monocrystalline efisiensi tinggi", "Frame aluminium kokoh"], isHighlight: true, tags: ["solar", "50wp"] },
  { name: "Solar Panel 100WP", slug: "solarpanel-100wp", category: "solarpanel", subcategory: "solarpanel-besar", description: "Solar panel 100WP untuk sistem tenaga surya rumah tangga.", specifications: [{ label: "Daya", value: "100WP" }, { label: "Tipe", value: "Monocrystalline" }, { label: "Efficiency", value: "21%" }, { label: "Dimensi", value: "1030x510x30mm" }], highlights: ["Populer untuk rumah tangga", "Sertifikasi IEC"], isHighlight: true, tags: ["solar", "100wp"] },
  { name: "Solar Panel 200WP", slug: "solarpanel-200wp", category: "solarpanel", subcategory: "solarpanel-besar", description: "Solar panel 200WP half-cut cell untuk efisiensi tinggi.", specifications: [{ label: "Daya", value: "200WP" }, { label: "Tipe", value: "Monocrystalline Half-Cut" }, { label: "Efficiency", value: "21.3%" }, { label: "Dimensi", value: "1480x680x30mm" }], highlights: ["Half-cut cell", "Efisiensi tinggi"], isHighlight: false, tags: ["solar", "200wp"] },
  { name: "Solar Panel 350WP", slug: "solarpanel-350wp", category: "solarpanel", subcategory: "solarpanel-besar", description: "Solar panel 350WP untuk sistem rooftop komersial.", specifications: [{ label: "Daya", value: "350WP" }, { label: "Tipe", value: "Monocrystalline PERC" }, { label: "Efficiency", value: "21.5%" }, { label: "Dimensi", value: "1690x990x35mm" }], highlights: ["PERC cell", "Ideal rooftop komersial"], isHighlight: true, tags: ["solar", "350wp"] },
  { name: "Solar Panel 450WP", slug: "solarpanel-450wp", category: "solarpanel", subcategory: "solarpanel-besar", description: "Solar panel 450WP bifacial untuk instalasi ground-mount.", specifications: [{ label: "Daya", value: "450WP" }, { label: "Tipe", value: "Bifacial PERC" }, { label: "Efficiency", value: "22%" }, { label: "Dimensi", value: "1900x990x35mm" }], highlights: ["Bifacial PERC", "Daya besar"], isHighlight: false, tags: ["solar", "450wp"] },
  { name: "Solar Panel 550WP", slug: "solarpanel-550wp", category: "solarpanel", subcategory: "solarpanel-besar", description: "Solar panel 550WP untuk solar farm skala utilitas.", specifications: [{ label: "Daya", value: "550WP" }, { label: "Tipe", value: "Bifacial PERC" }, { label: "Efficiency", value: "22.5%" }, { label: "Dimensi", value: "2278x1134x35mm" }], highlights: ["Kapasitas terbesar", "Untuk solar farm"], isHighlight: false, tags: ["solar", "550wp"] },
];

// --- Solar Panel Articles ---
const solarArticles = [
  { title: "Panduan Instalasi Solar Panel", slug: "panduan-instalasi-solar-panel", category: "solarpanel", excerpt: "Panduan lengkap instalasi solar panel dari perencanaan hingga komisioning.", content: "Instalasi solar panel yang benar dimulai dari survei lokasi, perhitungan kebutuhan daya, pemilihan komponen, hingga komisioning sistem. Pastikan orientasi panel menghadap utara (di Indonesia), sudut kemiringan 10-15 derajat, dan tidak ada bayangan yang menghalangi.", tags: ["solar", "instalasi", "panduan"], isHighlight: true },
  { title: "Hemat Listrik dengan Solar Panel", slug: "hemat-listrik-solar-panel", category: "solarpanel", excerpt: "Cara menghemat tagihan listrik dengan instalasi solar panel rooftop.", content: "Solar panel rooftop dapat mengurangi tagihan listrik PLN hingga 70%. Dengan sistem on-grid, kelebihan produksi energi dapat dijual ke PLN melalui skema net metering. ROI investasi solar panel saat ini sekitar 4-6 tahun.", tags: ["solar", "hemat", "listrik"], isHighlight: true },
  { title: "Perawatan Solar Panel agar Optimal", slug: "perawatan-solar-panel", category: "solarpanel", excerpt: "Tips merawat solar panel agar performa tetap optimal selama masa pakai.", content: "Perawatan solar panel relatif sederhana: bersihkan permukaan panel dari debu dan kotoran setiap 2-3 bulan, periksa koneksi kabel, dan monitor output daya secara berkala. Inverter dan baterai perlu pengecekan tahunan.", tags: ["solar", "perawatan"], isHighlight: false },
];

// --- Solar Panel Portfolio ---
const solarProjects = [
  { title: "Solar Rooftop Pabrik Sidoarjo", slug: "solar-rooftop-pabrik-sidoarjo", category: "solarpanel", clientName: "PT Manufaktur Jaya", location: "Sidoarjo", description: "Instalasi solar rooftop 200kWp untuk pabrik manufaktur.", completionYear: 2024, isHighlight: true },
  { title: "Solar Off-Grid Desa Kalimantan", slug: "solar-off-grid-desa-kalimantan", category: "solarpanel", clientName: "Kementerian ESDM", location: "Kalimantan Tengah", description: "Sistem solar off-grid untuk 5 desa terpencil di Kalimantan.", completionYear: 2024, isHighlight: true },
  { title: "Solar Rooftop Perkantoran Jakarta", slug: "solar-rooftop-perkantoran-jakarta", category: "solarpanel", clientName: "PT Office Tower", location: "Jakarta", description: "Instalasi solar rooftop 100kWp untuk gedung perkantoran.", completionYear: 2023, isHighlight: false },
];

// --- Penangkal Petir Products ---
const petirProducts = [
  { name: "Penangkal Petir Kurn R1", slug: "penangkal-petir-kurn-1", category: "penangkalpetir", subcategory: "kurn", description: "Penangkal petir ESE Kurn seri R1 dengan radius proteksi hingga 80 meter.", specifications: [{ label: "Tipe", value: "ESE (Early Streamer Emission)" }, { label: "Radius", value: "80 meter" }, { label: "Sertifikasi", value: "NFC 17-102" }, { label: "Material", value: "Stainless Steel" }], highlights: ["Radius proteksi luas", "Sertifikasi NFC 17-102"], isHighlight: true, tags: ["petir", "kurn"] },
  { name: "Penangkal Petir Kurn R2", slug: "penangkal-petir-kurn-2", category: "penangkalpetir", subcategory: "kurn", description: "Penangkal petir ESE Kurn seri R2 dengan radius proteksi hingga 107 meter.", specifications: [{ label: "Tipe", value: "ESE" }, { label: "Radius", value: "107 meter" }, { label: "Sertifikasi", value: "NFC 17-102" }, { label: "Material", value: "Stainless Steel" }], highlights: ["Radius proteksi ekstra", "Untuk bangunan tinggi"], isHighlight: false, tags: ["petir", "kurn"] },
  { name: "Penangkal Petir Viking V1", slug: "penangkal-petir-viking-1", category: "penangkalpetir", subcategory: "viking", description: "Penangkal petir ESE Viking V1 untuk proteksi bangunan komersial.", specifications: [{ label: "Tipe", value: "ESE" }, { label: "Radius", value: "79 meter" }, { label: "Sertifikasi", value: "NFC 17-102" }], highlights: ["Proteksi andal", "Harga kompetitif"], isHighlight: true, tags: ["petir", "viking"] },
  { name: "Penangkal Petir Viking V2", slug: "penangkal-petir-viking-2", category: "penangkalpetir", subcategory: "viking", description: "Penangkal petir ESE Viking V2 untuk proteksi area luas.", specifications: [{ label: "Tipe", value: "ESE" }, { label: "Radius", value: "107 meter" }, { label: "Sertifikasi", value: "NFC 17-102" }], highlights: ["Area proteksi luas", "Ideal pabrik"], isHighlight: false, tags: ["petir", "viking"] },
  { name: "Penangkal Petir Erico E1", slug: "penangkal-petir-erico-1", category: "penangkalpetir", subcategory: "erico", description: "Penangkal petir Erico Dynasphere untuk proteksi premium.", specifications: [{ label: "Tipe", value: "ESE" }, { label: "Radius", value: "100 meter" }, { label: "Brand", value: "Erico (nVent)" }], highlights: ["Brand premium global", "Teknologi terdepan"], isHighlight: true, tags: ["petir", "erico"] },
  { name: "Penangkal Petir Erico E2", slug: "penangkal-petir-erico-2", category: "penangkalpetir", subcategory: "erico", description: "Penangkal petir Erico untuk instalasi industri berat.", specifications: [{ label: "Tipe", value: "ESE" }, { label: "Radius", value: "120 meter" }, { label: "Brand", value: "Erico (nVent)" }], highlights: ["Proteksi industri berat", "Radius proteksi maksimal"], isHighlight: false, tags: ["petir", "erico"] },
  { name: "Penangkal Petir LPI Guardian G1", slug: "penangkal-petir-lpi-guardian-1", category: "penangkalpetir", subcategory: "lpi-guardian", description: "Penangkal petir LPI Guardian seri G1 untuk bangunan menengah.", specifications: [{ label: "Tipe", value: "ESE" }, { label: "Radius", value: "80 meter" }, { label: "Sertifikasi", value: "NFC 17-102" }], highlights: ["Harga terjangkau", "Kualitas terjamin"], isHighlight: true, tags: ["petir", "lpi"] },
  { name: "Penangkal Petir LPI Guardian G2", slug: "penangkal-petir-lpi-guardian-2", category: "penangkalpetir", subcategory: "lpi-guardian", description: "Penangkal petir LPI Guardian seri G2 untuk proteksi area luas.", specifications: [{ label: "Tipe", value: "ESE" }, { label: "Radius", value: "107 meter" }, { label: "Sertifikasi", value: "NFC 17-102" }], highlights: ["Area proteksi luas", "Kualitas Australia"], isHighlight: false, tags: ["petir", "lpi"] },
  { name: "Penangkal Petir Thomas T1", slug: "penangkal-petir-thomas-1", category: "penangkalpetir", subcategory: "thomas", description: "Penangkal petir Thomas untuk proteksi bangunan komersial.", specifications: [{ label: "Tipe", value: "ESE" }, { label: "Radius", value: "80 meter" }], highlights: ["Proteksi andal", "Teruji di Indonesia"], isHighlight: false, tags: ["petir", "thomas"] },
  { name: "Penangkal Petir Thomas T2", slug: "penangkal-petir-thomas-2", category: "penangkalpetir", subcategory: "thomas", description: "Penangkal petir Thomas untuk bangunan tinggi dan industri.", specifications: [{ label: "Tipe", value: "ESE" }, { label: "Radius", value: "107 meter" }], highlights: ["Untuk bangunan tinggi", "Radius luas"], isHighlight: false, tags: ["petir", "thomas"] },
  { name: "Penangkal Petir EF E1", slug: "penangkal-petir-ef-1", category: "penangkalpetir", subcategory: "ef", description: "Penangkal petir EF untuk proteksi standar bangunan.", specifications: [{ label: "Tipe", value: "ESE" }, { label: "Radius", value: "79 meter" }], highlights: ["Harga ekonomis", "Standar NFC 17-102"], isHighlight: false, tags: ["petir", "ef"] },
  { name: "Penangkal Petir EF E2", slug: "penangkal-petir-ef-2", category: "penangkalpetir", subcategory: "ef", description: "Penangkal petir EF untuk proteksi area luas.", specifications: [{ label: "Tipe", value: "ESE" }, { label: "Radius", value: "107 meter" }], highlights: ["Ekonomis untuk area luas", "Mudah instalasi"], isHighlight: false, tags: ["petir", "ef"] },
];

// --- Penangkal Petir Articles ---
const petirArticles = [
  { title: "Cara Kerja Penangkal Petir ESE", slug: "cara-kerja-penangkal-petir-ese", category: "penangkalpetir", excerpt: "Memahami prinsip kerja penangkal petir tipe ESE.", content: "Penangkal petir ESE (Early Streamer Emission) bekerja dengan memancarkan streamer lebih awal dari penangkal petir konvensional, sehingga menarik sambaran petir lebih cepat dan memberikan radius proteksi yang lebih luas.", tags: ["petir", "ese", "edukasi"], isHighlight: true },
  { title: "Panduan Instalasi Penangkal Petir", slug: "panduan-instalasi-penangkal-petir", category: "penangkalpetir", excerpt: "Panduan instalasi sistem penangkal petir sesuai standar SNI.", content: "Instalasi penangkal petir harus mengikuti standar SNI 03-7015-2004 dan NFC 17-102. Sistem terdiri dari air terminal (penangkal petir), down conductor, grounding system, dan surge protection device.", tags: ["petir", "instalasi"], isHighlight: true },
  { title: "Memilih Penangkal Petir yang Tepat", slug: "memilih-penangkal-petir-yang-tepat", category: "penangkalpetir", excerpt: "Tips memilih penangkal petir sesuai kebutuhan bangunan.", content: "Pemilihan penangkal petir tergantung pada tinggi bangunan, luas area, dan tingkat risiko sambaran. Untuk bangunan di atas 30 meter, gunakan ESE dengan radius proteksi minimal 107 meter. Pastikan sertifikasi NFC 17-102 dan garansi produk.", tags: ["petir", "panduan"], isHighlight: false },
];

// --- Penangkal Petir Portfolio ---
const petirProjects = [
  { title: "Penangkal Petir Gedung Surabaya", slug: "penangkal-petir-gedung-surabaya", category: "penangkalpetir", clientName: "PT Gedung Tinggi", location: "Surabaya", description: "Instalasi sistem penangkal petir Erico untuk gedung perkantoran 25 lantai.", completionYear: 2024, isHighlight: true },
  { title: "Penangkal Petir Pabrik Gresik", slug: "penangkal-petir-pabrik-gresik", category: "penangkalpetir", clientName: "PT Industri Gresik", location: "Gresik", description: "Instalasi sistem penangkal petir LPI Guardian untuk pabrik seluas 5 hektar.", completionYear: 2024, isHighlight: true },
  { title: "Penangkal Petir Rumah Sakit Malang", slug: "penangkal-petir-rumah-sakit-malang", category: "penangkalpetir", clientName: "RSUD Malang", location: "Malang", description: "Instalasi sistem penangkal petir Kurn untuk rumah sakit 8 lantai.", completionYear: 2023, isHighlight: false },
];

// ============================================================================
// DOCUMENT BUILDERS
// ============================================================================

interface ProductData {
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  description: string;
  specifications: { label: string; value: string }[];
  highlights: string[];
  isHighlight: boolean;
  tags: string[];
}

interface ArticleData {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  tags: string[];
  isHighlight: boolean;
}

interface PortfolioData {
  title: string;
  slug: string;
  category: string;
  clientName: string;
  location: string;
  description: string;
  completionYear: number;
  isHighlight: boolean;
}

function makeProductDoc(product: ProductData, spokeRefId: string, subdomain: string, index: number) {
  return {
    // KEY FIX: subdomain-prefixed _id to prevent any collision
    _id: `${subdomain}-product-${product.slug}`,
    _type: "product",
    name: product.name,
    slug: { _type: "slug", current: product.slug },
    spoke: { _type: "reference", _ref: spokeRefId },
    category: product.category,
    subcategory: product.subcategory,
    description: product.description,
    specifications: (product.specifications || []).map((s, i) => ({
      _type: "specification",
      _key: `spec-${subdomain}-${index}-${i}`,
      label: s.label,
      value: s.value,
    })),
    highlights: product.highlights || [],
    isHighlight: product.isHighlight || false,
    tags: product.tags || [],
  };
}

function makeArticleDoc(article: ArticleData, spokeRefId: string, subdomain: string, index: number) {
  return {
    _id: `${subdomain}-article-${article.slug}`,
    _type: "article",
    title: article.title,
    slug: { _type: "slug", current: article.slug },
    spoke: { _type: "reference", _ref: spokeRefId },
    category: article.category,
    excerpt: article.excerpt,
    content: article.content,
    tags: article.tags || [],
    isHighlight: article.isHighlight || false,
    author: "Tim Arostech",
    publishedAt: new Date().toISOString().split("T")[0],
  };
}

function makePortfolioDoc(project: PortfolioData, spokeRefId: string, subdomain: string, index: number) {
  return {
    _id: `${subdomain}-portfolio-${project.slug}`,
    _type: "portfolioEntry",
    title: project.title,
    slug: { _type: "slug", current: project.slug },
    spoke: { _type: "reference", _ref: spokeRefId },
    category: project.category,
    client: project.clientName || "",
    location: project.location || "",
    description: project.description,
    year: project.completionYear || new Date().getFullYear(),
    isHighlight: project.isHighlight || false,
  };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("🚀 Clean + Populate Sanity Studio\n");

  // ── Step 1: Delete ALL existing documents ──────────────────────
  console.log("🧹 Step 1: Cleaning existing documents...");
  for (const docType of ["product", "article", "portfolioEntry", "companyInfo", "spokeConfig", "project"]) {
    const result = await sanityQuery(`*[_type == "${docType}"]._id`);
    const ids = result.result || [];
    if (ids.length > 0) {
      const mutations = ids.map((id: string) => ({ delete: { id } }));
      for (let i = 0; i < mutations.length; i += 100) {
        await sanityMutate(mutations.slice(i, i + 100));
      }
      console.log(`  Deleted ${ids.length} ${docType} documents`);
    } else {
      console.log(`  No ${docType} documents to delete`);
    }
  }

  // ── Step 2: Create spokeConfig documents ──────────────────────
  console.log("\n📋 Step 2: Creating spokeConfig documents...");
  for (const config of spokeConfigs) {
    await sanityMutate([{ createOrReplace: config }]);
    console.log(`  ✅ ${config.name} (${config.subdomain})`);
  }

  // ── Step 3: Create content per spoke ──────────────────────────
  const spokeMap = [
    { subdomain: "pju", spokeId: "spoke-config-pju", products: pjuProducts, articles: pjuArticles, projects: pjuProjects, label: "PJU" },
    { subdomain: "baterai", spokeId: "spoke-config-baterai", products: bateraiProducts, articles: bateraiArticles, projects: bateraiProjects, label: "Baterai" },
    { subdomain: "solarpanel", spokeId: "spoke-config-solarpanel", products: solarProducts, articles: solarArticles, projects: solarProjects, label: "Solar Panel" },
    { subdomain: "penangkalpetir", spokeId: "spoke-config-penangkalpetir", products: petirProducts, articles: petirArticles, projects: petirProjects, label: "Penangkal Petir" },
  ];

  console.log("\n📦 Step 3: Creating content documents...");
  for (const spoke of spokeMap) {
    // Products
    const productMutations = spoke.products.map((p, i) => ({
      createOrReplace: makeProductDoc(p, spoke.spokeId, spoke.subdomain, i),
    }));
    for (let i = 0; i < productMutations.length; i += 50) {
      await sanityMutate(productMutations.slice(i, i + 50));
    }
    console.log(`  ✅ ${spoke.label}: ${spoke.products.length} products`);

    // Articles
    const articleMutations = spoke.articles.map((a, i) => ({
      createOrReplace: makeArticleDoc(a, spoke.spokeId, spoke.subdomain, i),
    }));
    for (let i = 0; i < articleMutations.length; i += 50) {
      await sanityMutate(articleMutations.slice(i, i + 50));
    }
    console.log(`  ✅ ${spoke.label}: ${spoke.articles.length} articles`);

    // Portfolio
    const portfolioMutations = spoke.projects.map((p, i) => ({
      createOrReplace: makePortfolioDoc(p, spoke.spokeId, spoke.subdomain, i),
    }));
    for (let i = 0; i < portfolioMutations.length; i += 50) {
      await sanityMutate(portfolioMutations.slice(i, i + 50));
    }
    console.log(`  ✅ ${spoke.label}: ${spoke.projects.length} portfolio entries`);
  }

  // ── Step 4: Verify data ───────────────────────────────────────
  console.log("\n🔍 Step 4: Verifying data integrity...");
  for (const spoke of spokeMap) {
    const productResult = await sanityQuery(
      `*[_type == "product" && spoke->subdomain == "${spoke.subdomain}"]{ name, category, "spokeSubdomain": spoke->subdomain }`
    );
    const products = productResult.result || [];
    const wrongProducts = products.filter((p: { category: string; spokeSubdomain: string }) => p.category !== spoke.subdomain && !(spoke.subdomain === "pju" && p.category === "pju"));
    if (wrongProducts.length > 0) {
      console.error(`  ❌ ${spoke.label}: ${wrongProducts.length} products with WRONG category!`, wrongProducts);
    } else {
      console.log(`  ✅ ${spoke.label}: All ${products.length} products have correct category (${spoke.subdomain})`);
    }
  }

  console.log("\n🎉 Done! Sanity Studio has been re-populated with correct data.");
  console.log("   Open Studio at /studio to see content organized by spoke.");
  console.log("   NOTE: Images are NOT included. Upload images manually in Studio.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
