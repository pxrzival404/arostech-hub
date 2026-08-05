/**
 * Seed test RFQ orders for non-PJU subdomains
 * 
 * Creates test RFQs for baterai, solarpanel, and penangkalpetir subdomains
 * so the admin can verify the category filter works correctly.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding test RFQ orders for non-PJU subdomains...\n");

  // Test clients for each subdomain
  const testClients = [
    {
      email: "baterai-test@arostech.id",
      name: "Budi Santoso",
      phone: "+62 812-3456-7890",
      company: "PT Baterai Indo",
      companyAddress: "Jl. Rungkut Industri No. 45, Surabaya",
      subdomain: "baterai",
    },
    {
      email: "solar-test@arostech.id",
      name: "Siti Rahayu",
      phone: "+62 813-9876-5432",
      company: "PT Surya Mandiri",
      companyAddress: "Jl. Gatot Subroto No. 12, Jakarta",
      subdomain: "solarpanel",
    },
    {
      email: "petir-test@arostech.id",
      name: "Agus Wijaya",
      phone: "+62 814-1111-2222",
      company: "PT Proteksi Kilat",
      companyAddress: "Jl. Ahmad Yani No. 88, Semarang",
      subdomain: "penangkalpetir",
    },
  ];

  // Test RFQ items for each subdomain
  const testRFQs = [
    {
      subdomain: "baterai",
      folderName: "Pengadaan Baterai UPS Data Center",
      items: [
        { productName: "Baterai 12V 100Ah", productSlug: "baterai-12v-100ah", subcategory: "baterai-12v", quantity: 32 },
        { productName: "UPS 2000VA", productSlug: "ups-2000va", subcategory: "ups", quantity: 2 },
      ],
    },
    {
      subdomain: "baterai",
      folderName: "Baterai Solar Off-Grid NTT",
      items: [
        { productName: "Baterai 12V 200Ah", productSlug: "baterai-12v-200ah", subcategory: "baterai-12v", quantity: 16 },
      ],
    },
    {
      subdomain: "solarpanel",
      folderName: "Pengadaan Solar Rooftop Pabrik",
      items: [
        { productName: "Solar Panel 450WP", productSlug: "solarpanel-450wp", subcategory: "solarpanel-besar", quantity: 120 },
        { productName: "Solar Panel 550WP", productSlug: "solarpanel-550wp", subcategory: "solarpanel-besar", quantity: 80 },
      ],
    },
    {
      subdomain: "solarpanel",
      folderName: "PLTS Desa Terpencil Kalimantan",
      items: [
        { productName: "Solar Panel 200WP", productSlug: "solarpanel-200wp", subcategory: "solarpanel-besar", quantity: 50 },
      ],
    },
    {
      subdomain: "penangkalpetir",
      folderName: "Instalasi Penangkal Petir Gedung Surabaya",
      items: [
        { productName: "Penangkal Petir Viking V-40", productSlug: "penangkal-petir-viking-v40", subcategory: "viking", quantity: 4 },
        { productName: "Penangkal Petir Kurn Series 2", productSlug: "penangkal-petir-kurn-2", subcategory: "kurn", quantity: 2 },
      ],
    },
    {
      subdomain: "penangkalpetir",
      folderName: "Proteksi Petir Kawasan Industri Gresik",
      items: [
        { productName: "Penangkal Petir Erico ESE-30", productSlug: "penangkal-petir-erico-ese30", subcategory: "erico", quantity: 6 },
      ],
    },
  ];

  for (const clientData of testClients) {
    const client = await prisma.client.upsert({
      where: { email: clientData.email },
      update: {},
      create: {
        email: clientData.email,
        name: clientData.name,
        phone: clientData.phone,
        company: clientData.company,
        companyAddress: clientData.companyAddress,
        subdomain: clientData.subdomain,
      },
    });
    console.log(`✅ Client: ${client.name} (${client.subdomain})`);

    // Create RFQs for this subdomain
    const rfqs = testRFQs.filter((r) => r.subdomain === client.subdomain);
    for (const rfqData of rfqs) {
      const rfq = await prisma.rFQ.create({
        data: {
          clientId: client.id,
          folderName: rfqData.folderName,
          status: "SUBMITTED",
          totalProducts: rfqData.items.reduce((sum, i) => sum + i.quantity, 0),
          submittedAt: new Date(),
          companyName: client.company,
          companyContactPerson: client.name,
          companyEmail: client.email,
          companyAddress: client.companyAddress,
          shippingCity: "Surabaya",
          shippingAddress: client.companyAddress || "",
          subdomain: rfqData.subdomain,
          items: {
            create: rfqData.items.map((item) => ({
              productName: item.productName,
              productSlug: item.productSlug,
              subcategory: item.subcategory,
              quantity: item.quantity,
            })),
          },
        },
      });
      console.log(`  📋 RFQ: ${rfq.folderName} (${rfq.id.slice(-6)})`);
    }
  }

  // Also create a test contact message for each non-PJU subdomain
  const testMessages = [
    {
      name: "Budi Santoso",
      email: "baterai-test@arostech.id",
      phone: "+62 812-3456-7890",
      subject: "Pertanyaan tentang Baterai 12V 200Ah",
      message: "Halo, saya ingin bertanya tentang ketersediaan Baterai 12V 200Ah untuk proyek data center kami. Apakah bisa dikirim ke Surabaya dalam 2 minggu?",
      subdomain: "baterai",
    },
    {
      name: "Siti Rahayu",
      email: "solar-test@arostech.id",
      phone: "+62 813-9876-5432",
      subject: "Permintaan Penawaran Solar Panel 550WP",
      message: "Kami membutuhkan penawaran harga untuk 200 unit Solar Panel 550WP untuk proyek rooftop pabrik kami di Jakarta. Mohon info harga terbaik.",
      subdomain: "solarpanel",
    },
    {
      name: "Agus Wijaya",
      email: "petir-test@arostech.id",
      phone: "+62 814-1111-2222",
      subject: "Konsultasi Instalasi Penangkal Petir",
      message: "Kami berencana memasang sistem penangkal petir di gedung perkantoran 12 lantai di Semarang. Bisakah dilakukan survey lokasi terlebih dahulu?",
      subdomain: "penangkalpetir",
    },
  ];

  for (const msg of testMessages) {
    const message = await prisma.contactMessage.create({
      data: msg,
    });
    console.log(`  📬 Message: ${msg.subject} (${msg.subdomain})`);
  }

  console.log("\n✅ Test data seeding complete!");
  console.log("\nCreated:");
  console.log("  - 3 test clients (baterai, solarpanel, penangkalpetir)");
  console.log("  - 6 test RFQs (2 per subdomain)");
  console.log("  - 3 test contact messages (1 per subdomain)");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
