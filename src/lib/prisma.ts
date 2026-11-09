import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Type definition for the global object to handle hot reloading in development
interface GlobalWithPrisma {
  prisma?: PrismaClient
}

const globalForPrisma = globalThis as unknown as GlobalWithPrisma

// Fix SSL deprecation warning by replacing sslmode=require with sslmode=verify-full
function getConnectionString(): string {
  const url = process.env.DATABASE_URL || ''
  // Replace deprecated sslmode values with verify-full
  return url.replace(/sslmode=(require|prefer|verify-ca)/g, 'sslmode=verify-full')
}

const pool = new pg.Pool({
  connectionString: getConnectionString(),
})
const adapter = new PrismaPg(pool)

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
