import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const logger = {
  info: (message: string, meta?: Record<string, any>) => {
    console.info(JSON.stringify({ level: 'info', message, ...meta }))
  },
  error: (message: string, error?: any) => {
    console.error(JSON.stringify({ level: 'error', message, error: error instanceof Error ? error.message : error }))
  }
}


const sampleRedirects = [
  // Hub mappings
  {
    legacyUrl: '/tentang-kami',
    targetUrl: '/about',
    spoke: 'hub',
  },
  {
    legacyUrl: '/kontak-kami',
    targetUrl: '/contact',
    spoke: 'hub',
  },
  {
    legacyUrl: '/layanan-kami',
    targetUrl: '/services',
    spoke: 'hub',
  },
  {
    legacyUrl: '/katalog-produk.pdf',
    targetUrl: '/assets/catalog.pdf',
    spoke: 'hub',
  },
  
  // PJU (Smart Street Lighting) Spoke mappings
  {
    legacyUrl: '/pju/lampu-jalan-led',
    targetUrl: '/products/led-street-lights',
    spoke: 'pju',
  },
  {
    legacyUrl: '/pju/tiang-lampu-pju',
    targetUrl: '/products/octagonal-poles',
    spoke: 'pju',
  },
  {
    legacyUrl: '/pju/paket-pju-solar-cell',
    targetUrl: '/solutions/all-in-one-solar-pju',
    spoke: 'pju',
  },

  // Solar Cell Spoke mappings
  {
    legacyUrl: '/solarcell/panel-surya-100wp',
    targetUrl: '/products/solar-panels/mono-100wp',
    spoke: 'solarcell',
  },
  {
    legacyUrl: '/solarcell/inverter-hybrid',
    targetUrl: '/products/inverters/hybrid-smart',
    spoke: 'solarcell',
  },
  {
    legacyUrl: '/solarcell/paket-plts-rumah',
    targetUrl: '/solutions/residential-solar-packages',
    spoke: 'solarcell',
  },

  // Alat Petir (Lightning Protection) Spoke mappings
  {
    legacyUrl: '/alatpetir/penangkal-petir-radius',
    targetUrl: '/products/lightning-rods/radius-ese',
    spoke: 'alatpetir',
  },
  {
    legacyUrl: '/alatpetir/grounding-tembaga',
    targetUrl: '/products/grounding/copper-rod',
    spoke: 'alatpetir',
  },

  // Baterai (Industrial Battery) Spoke mappings
  {
    legacyUrl: '/baterai/baterai-lithium-lifepo4',
    targetUrl: '/products/batteries/lithium-lifepo4',
    spoke: 'baterai',
  },
  {
    legacyUrl: '/baterai/baterai-vrla-gel',
    targetUrl: '/products/batteries/vrla-gel-12v',
    spoke: 'baterai',
  },
]

async function main() {
  logger.info('Starting redirect maps seeding...')
  
  for (const item of sampleRedirects) {
    const upserted = await prisma.redirectMap.upsert({
      where: { legacyUrl: item.legacyUrl },
      update: {
        targetUrl: item.targetUrl,
        spoke: item.spoke,
      },
      create: {
        legacyUrl: item.legacyUrl,
        targetUrl: item.targetUrl,
        spoke: item.spoke,
        hitCount: 0,
      },
    })
    logger.info('Seeded redirect map', {
      legacyUrl: upserted.legacyUrl,
      targetUrl: upserted.targetUrl,
      spoke: upserted.spoke,
    })
  }

  logger.info('Seeding finished successfully.')
}

main()
  .catch((e) => {
    logger.error('Error during seeding', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

