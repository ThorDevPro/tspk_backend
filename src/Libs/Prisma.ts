import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export { prisma }

// to create new migration run:
// npx prisma migrate dev --name init
// to apply migration run:
// npx prisma migrate deploy