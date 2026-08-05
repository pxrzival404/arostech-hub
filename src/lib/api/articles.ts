export interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  author: string | null;
  publishedAt: string;
  readingTime: number;
}

export const articles: Article[] = [
  {
    id: "a1",
    slug: "tren-pju-tenaga-surya-2024-smart-city",
    title: "Tren PJU Tenaga Surya 2024: Solusi Penerangan Hemat Energi untuk Kota Cerdas",
    category: "Energi Terbarukan",
    excerpt: "Penerangan jalan umum tenaga surya menjadi solusi utama bagi pemerintah daerah yang ingin mengurangi biaya listrik dan mendukung pembangunan smart city.",
    content: `
      <p>Penerangan Jalan Umum Tenaga Surya (PJUTS) telah berkembang menjadi pilar penting dalam pembangunan infrastruktur perkotaan modern di Indonesia. Memasuki tahun 2024, adopsi PJUTS mengalami peningkatan signifikan, didorong oleh efisiensi biaya operasional jangka panjang dan urgensi transisi ke energi ramah lingkungan.</p>
      
      <h3>Mengapa Pemerintah Daerah Beralih ke PJUTS?</h3>
      <p>Beban tagihan listrik untuk penerangan jalan sering kali menjadi salah satu pos pengeluaran terbesar bagi Anggaran Pendapatan dan Belanja Daerah (APBD). Dengan menerapkan PJUTS, pemerintah daerah dapat menekan pengeluaran ini hingga 100% untuk titik-titik yang terpasang, karena sistem ini sepenuhnya memanfaatkan energi matahari secara mandiri.</p>
      
      <h3>Teknologi PJUTS All-in-One dan Smart System</h3>
      <p>Tren utama di tahun 2024 adalah integrasi sensor pintar dan Internet of Things (IoT). Dengan Smart PJUTS, operator dapat mengontrol intensitas cahaya secara remote (dimming), memantau kesehatan baterai, serta mendeteksi kerusakan secara real-time dari ruang kontrol pusat. Selain itu, desain 'All-in-One' yang menggabungkan panel surya, baterai lithium, kontroler, dan lampu LED dalam satu wadah ringkas membuat proses instalasi menjadi jauh lebih cepat dan meminimalkan risiko pencurian komponen.</p>
      
      <h3>Kontribusi Terhadap Smart City</h3>
      <p>Sebagai bagian dari ekosistem kota cerdas (Smart City), PJUTS tidak sekadar berfungsi sebagai penerang jalan. Tiang-tiang PJUTS kini mulai difungsikan sebagai stasiun pengisian daya kendaraan listrik, sensor cuaca, hingga hub pemancar Wi-Fi publik. Ini adalah langkah konkret menuju masa depan Indonesia yang lebih bersih dan terkoneksi.</p>
    `,
    author: "Tim Redaksi DBSN",
    publishedAt: "2024-10-15",
    readingTime: 5
  },
  {
    id: "a2",
    slug: "panduan-pengadaan-lkpp-e-katalog-vendor",
    title: "Panduan Lengkap Pengadaan Barang Melalui LKPP dan e-Katalog",
    category: "Regulasi",
    excerpt: "Panduan lengkap proses pengadaan barang dan jasa melalui LKPP untuk instansi pemerintah. Pelajari langkah-langkah registrasi e-Katalog dan verifikasi vendor.",
    content: `
      <p>Sistem pengadaan barang dan jasa pemerintah di Indonesia telah mengalami transformasi digital yang masif melalui platform e-Katalog yang dikelola oleh LKPP (Lembaga Kebijakan Pengadaan Barang/Jasa Pemerintah). Platform ini memudahkan instansi pemerintah untuk membeli produk secara langsung dengan proses yang transparan, cepat, dan akuntabel.</p>
      
      <h3>Apa itu e-Katalog LKPP?</h3>
      <p>e-Katalog adalah sistem informasi elektronik yang memuat daftar, merek, spesifikasi teknis, harga, dan jumlah barang/jasa tertentu dari berbagai penyedia. Ini bertindak layaknya toko online resmi pemerintah di mana Pejabat Pembuat Komitmen (PPK) dapat melakukan pembelian langsung (e-Purchasing) tanpa perlu melalui proses lelang konvensional yang memakan waktu lama.</p>
      
      <h3>Langkah-langkah Pengadaan e-Purchasing</h3>
      <ol>
        <li><strong>Perencanaan:</strong> Identifikasi kebutuhan barang, volume, dan spesifikasi teknis proyek.</li>
        <li><strong>Pencarian Produk:</strong> Akses portal e-Katalog LKPP dan cari produk berdasarkan kategori atau merek (misalnya produk PJU atau Solar Cell DBSN).</li>
        <li><strong>Negosiasi & Pemesanan:</strong> Lakukan negosiasi harga, biaya pengiriman, dan waktu penyelesaian secara digital di dalam sistem e-Katalog.</li>
        <li><strong>Kontrak & Pembayaran:</strong> Setelah pesanan disetujui penyedia, surat perjanjian diterbitkan dan barang siap dikirim sesuai kesepakatan.</li>
      </ol>
      
      <h3>Keuntungan Bagi Instansi Pemerintah</h3>
      <p>Dengan e-Katalog, risiko korupsi dan manipulasi harga dapat ditekan secara drastis karena seluruh riwayat harga dan transaksi tercatat secara transparan. Proses pengerjaan proyek infrastruktur daerah pun dapat berjalan lebih cepat tanpa hambatan birokrasi tender yang berbelit-belit.</p>
    `,
    author: "Divisi Legal DBSN",
    publishedAt: "2024-09-28",
    readingTime: 8
  },
  {
    id: "a3",
    slug: "pentingnya-tkdn-infrastruktur-indonesia",
    title: "Mengapa TKDN Penting dalam Pengadaan Infrastruktur Indonesia?",
    category: "Industri",
    excerpt: "Tingkat Komponen Dalam Negeri (TKDN) menjadi faktor krusial dalam pengadaan proyek infrastruktur. Simak dampaknya terhadap perekonomian nasional.",
    content: `
      <p>Tingkat Komponen Dalam Negeri (TKDN) merupakan persentase nilai komponen dalam negeri pada barang, jasa, maupun gabungan barang dan jasa. Dalam beberapa tahun terakhir, Pemerintah Indonesia semakin memperketat regulasi TKDN, khususnya pada proyek-proyek strategis nasional yang menggunakan dana APBN atau APBD.</p>
      
      <h3>Mendorong Kemandirian Industri Nasional</h3>
      <p>Kebijakan TKDN dirancang untuk mengurangi ketergantungan terhadap barang impor dan memperkuat struktur industri dalam negeri. Dengan mensyaratkan batas minimum TKDN tertentu, industri manufaktur lokal didorong untuk terus berkembang dan menciptakan lapangan pekerjaan baru bagi masyarakat Indonesia.</p>
      
      <h3>Keuntungan Bagi Kontraktor dan Produsen</h3>
      <p>Produk yang memiliki sertifikat TKDN tinggi mendapatkan preferensi harga dalam proses lelang pemerintah. Artinya, jika suatu produk lokal bersertifikasi TKDN bersaing dengan produk impor dengan harga setara, maka produk lokal memiliki peluang jauh lebih besar untuk memenangkan tender pengadaan.</p>
      
      <h3>Komitmen DBSN terhadap TKDN</h3>
      <p>PT. DBSN Dayaberkah.id berkomitmen penuh mendukung program pemerintah ini dengan terus meningkatkan kandungan lokal pada lini produk kami, seperti lampu jalan LED, modul surya, dan box panel. Melalui sertifikasi TKDN resmi, kami memastikan seluruh mitra kontraktor dan instansi pemerintah dapat bermitra dengan tenang dan sesuai koridor hukum yang berlaku.</p>
    `,
    author: "Budi Prasetyo, S.T., M.Eng.",
    publishedAt: "2024-09-10",
    readingTime: 6
  },
  {
    id: "a4",
    slug: "perbandingan-panel-surya-monocrystalline-polycrystalline",
    title: "Perbandingan Panel Surya Monocrystalline vs Polycrystalline: Mana yang Lebih Baik?",
    category: "Energi Terbarukan",
    excerpt: "Artikel perbandingan mendalam antara panel surya monocrystalline dan polycrystalline untuk membantu Anda memilih teknologi yang tepat.",
    content: `
      <p>Ketika merencanakan instalasi Pembangkit Listrik Tenaga Surya (PLTS), salah satu keputusan paling krusial adalah memilih jenis modul panel surya. Dua teknologi yang mendominasi pasar saat ini adalah Monocrystalline dan Polycrystalline. Berikut perbandingan mendalam untuk membantu Anda memilih teknologi terbaik.</p>
      
      <h3>1. Monocrystalline (Mono-si)</h3>
      <p>Panel surya Monocrystalline dibuat dari batangan silikon kristal tunggal berkinerja tinggi. Jenis ini mudah dikenali dari selnya yang berwarna hitam gelap dengan sudut-sudut terpotong.</p>
      <ul>
        <li><strong>Efisiensi:</strong> Tertinggi di kelasnya (rata-rata 19% - 22%), sehingga memerlukan lebih sedikit ruang atap untuk menghasilkan daya yang sama.</li>
        <li><strong>Daya Tahan:</strong> Sangat tinggi dengan performa optimal di cuaca mendung atau intensitas cahaya rendah.</li>
        <li><strong>Harga:</strong> Relatif lebih mahal dibanding Polycrystalline karena proses pembuatan silikon kristal tunggal yang kompleks.</li>
      </ul>
      
      <h3>2. Polycrystalline (Poly-si)</h3>
      <p>Panel surya Polycrystalline dibuat dengan melebur beberapa kristal silikon secara bersamaan. Panel ini memiliki tampilan bercak biru terang yang khas.</p>
      <ul>
        <li><strong>Efisiensi:</strong> Sedikit lebih rendah (sekitar 15% - 17%), sehingga memerlukan area instalasi yang lebih luas untuk output daya yang setara.</li>
        <li><strong>Performa Suhu:</strong> Cenderung menurun lebih cepat pada suhu lingkungan yang sangat panas dibandingkan model Mono.</li>
        <li><strong>Harga:</strong> Lebih ekonomis, menjadikannya pilihan ideal untuk proyek skala besar dengan ketersediaan lahan luas (ground-mounted).</li>
      </ul>
      
      <h3>Kesimpulan</h3>
      <p>Pilihlah <strong>Monocrystalline</strong> jika ruang instalasi Anda terbatas (seperti PLTS Atap rumah) dan Anda menginginkan kinerja jangka panjang maksimal. Namun, jika Anda memiliki lahan luas dan anggaran proyek terbatas, <strong>Polycrystalline</strong> menawarkan pengembalian investasi (ROI) yang sangat menarik.</p>
    `,
    author: "Tim Teknis DBSN",
    publishedAt: "2024-08-22",
    readingTime: 7
  },
  {
    id: "a5",
    slug: "standar-sni-penangkal-petir-perlindungan-bangunan",
    title: "Standar SNI untuk Penangkal Petir: Perlindungan Optimal bagi Bangunan",
    category: "Teknik",
    excerpt: "Memahami standar SNI untuk sistem penangkal petir dan cara memastikan bangunan Anda terlindungi dari sambaran petir secara efektif.",
    content: `
      <p>Sebagai negara tropis yang terletak di khatulistiwa, Indonesia memiliki tingkat kerapatan sambaran petir yang sangat tinggi. Oleh karena itu, pemasangan Sistem Proteksi Petir (SPP) pada gedung dan infrastruktur publik bukan sekadar pelengkap, melainkan suatu keharusan teknis untuk melindungi aset dan nyawa.</p>
      
      <h3>Pentingnya Standar SNI IEC 62305</h3>
      <p>Pemasangan penangkal petir di Indonesia wajib merujuk pada standar nasional Indonesia yang diadopsi dari standar internasional, yaitu **SNI IEC 62305**. Standar ini mengatur desain, instalasi, pengujian, dan pemeliharaan sistem proteksi petir eksternal maupun internal.</p>
      
      <h3>Tiga Elemen Utama Proteksi Petir Eksternal</h3>
      <ol>
        <li><strong>Air Termination (Finial):</strong> Komponen penerima sambaran langsung. Dapat berupa sistem Franklin konvensional maupun sistem elektrostatik radius (Early Streamer Emission/ESE).</li>
        <li><strong>Down Conductor:</strong> Kabel penyalur arus petir dari atap menuju sistem pembumian secara aman tanpa memicu lompatan api listrik ke struktur bangunan.</li>
        <li><strong>Earth Termination System (Grounding):</strong> Elektroda pembumian untuk menyebarkan arus petir berdaya tinggi langsung ke dalam tanah dengan nilai tahanan seoptimal mungkin (ideal &lt; 5 Ohm).</li>
      </ol>
      
      <h3>Proteksi Internal (Surge Arrester)</h3>
      <p>Sambaran petir tidak hanya merusak secara fisik, tetapi juga dapat menginduksi lonjakan tegangan (surge) pada kabel listrik dan data yang dapat merusak peralatan elektronik sensitif di dalam gedung. Pemasangan surge arrester mutlak diperlukan di panel listrik utama untuk meredam bahaya ini.</p>
    `,
    author: "Tim Engineering DBSN",
    publishedAt: "2024-08-05",
    readingTime: 4
  },
  {
    id: "a6",
    slug: "battery-energy-storage-system-bess-indonesia",
    title: "Battery Energy Storage System (BESS): Masa Depan Penyimpanan Energi Indonesia",
    category: "Teknologi",
    excerpt: "Teknologi penyimpanan energi berkembang pesat. BESS menjadi kunci dalam integrasi energi terbarukan ke jaringan listrik Indonesia.",
    content: `
      <p>Energi terbarukan seperti matahari dan angin memiliki sifat intermiten (tidak stabil sepanjang waktu). Untuk mengatasi tantangan ini, teknologi Battery Energy Storage System (BESS) hadir sebagai solusi penyimpanan energi skala besar yang krusial bagi keandalan sistem kelistrikan masa depan.</p>
      
      <h3>Bagaimana Cara Kerja BESS?</h3>
      <p>BESS menyimpan energi listrik berlebih yang dihasilkan oleh pembangkit listrik (misalnya PLTS pada siang hari) ke dalam sel baterai lithium-ion berkapasitas besar. Energi yang tersimpan ini kemudian dilepaskan kembali ke jaringan listrik ketika permintaan memuncak (peak hours) atau ketika pembangkit utama berhenti berproduksi (seperti pada malam hari).</p>
      
      <h3>Aplikasi BESS di Indonesia</h3>
      <ul>
        <li><strong>Mikrogrid Off-grid:</strong> Menyediakan pasokan listrik 24 jam nonstop bagi desa terpencil dan pulau terluar yang belum terkoneksi jaringan PLN.</li>
        <li><strong>Stabilisasi Jaringan (Grid Stabilization):</strong> Mencegah pemadaman akibat fluktuasi mendadak pada sistem pembangkit energi terbarukan.</li>
        <li><strong>Peak Shaving Industri:</strong> Membantu pabrik mengurangi biaya tagihan listrik beban puncak dengan memanfaatkan daya baterai.</li>
      </ul>
      
      <h3>Teknologi Baterai LiFePO4</h3>
      <p>Teknologi baterai Lithium Iron Phosphate (LiFePO4) kini menjadi standar industri untuk BESS karena memiliki siklus hidup yang sangat panjang (hingga 6000+ kali pengisian), efisiensi tinggi, tingkat keamanan termal yang sangat baik, dan bebas perawatan.</p>
    `,
    author: "Ir. Darmawan B. Santoso, M.T.",
    publishedAt: "2024-07-18",
    readingTime: 9
  }
];

export const getArticleBySlug = (slug: string): Article | undefined => {
  return articles.find((a) => a.slug === slug);
};
