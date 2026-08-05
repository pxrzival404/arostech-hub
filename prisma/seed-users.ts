import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD
  if (!defaultPassword) {
    console.error(JSON.stringify({ level: 'error', message: 'ADMIN_DEFAULT_PASSWORD environment variable is required for seeding' }))
    process.exit(1)
  }

  console.info(JSON.stringify({ level: 'info', message: 'Starting admin user seeding...' }))

  const hash = await bcrypt.hash(defaultPassword, 12)

  const adminEmail = 'admin@dbsn.co.id'

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      hashedPassword: hash,
    },
    create: {
      email: adminEmail,
      name: 'System Admin',
      hashedPassword: hash,
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.info(JSON.stringify({
    level: 'info',
    message: `Admin user seeded successfully`,
    userId: user.id,
    email: user.email,
  }))
}

main()
  .catch((e) => {
    console.error(JSON.stringify({ level: 'error', message: 'Error during admin seeding', error: e instanceof Error ? e.message : String(e) }))
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
