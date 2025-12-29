import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { Decimal } from 'decimal.js'

// Prisma 7 requires PostgreSQL adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.expense.deleteMany({})
  await prisma.timelineEvent.deleteMany({})
  await prisma.currencyCache.deleteMany({})
  await prisma.exchangeRate.deleteMany({})

  // Create timeline events
  const milestone1 = await prisma.timelineEvent.create({
    data: {
      title: 'Project Kickoff',
      description: 'Initial planning and setup',
      eventType: 'MILESTONE',
      status: 'COMPLETED',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-05'),
      progress: 100,
      tags: ['planning'],
      priority: 5,
    },
  })

  const task1 = await prisma.timelineEvent.create({
    data: {
      title: 'Card Cropping Phase 1',
      description: 'Crop first batch of Pokemon cards',
      eventType: 'TASK',
      status: 'IN_PROGRESS',
      startDate: new Date('2024-01-06'),
      dueDate: new Date('2024-02-06'),
      progress: 60,
      parentId: milestone1.id,
      tags: ['cropping'],
      priority: 4,
    },
  })

  const task2 = await prisma.timelineEvent.create({
    data: {
      title: 'Motion Work - Intro Animation',
      description: 'Create intro animation for video',
      eventType: 'TASK',
      status: 'PENDING',
      startDate: new Date('2024-02-07'),
      dueDate: new Date('2024-02-28'),
      progress: 0,
      tags: ['motion', 'animation'],
      priority: 3,
    },
  })

  await prisma.timelineEvent.create({
    data: {
      title: 'First Delivery',
      description: 'Deliver first set of cropped cards',
      eventType: 'DEADLINE',
      status: 'PENDING',
      startDate: new Date('2024-02-28'),
      dueDate: new Date('2024-02-28'),
      progress: 0,
      tags: ['delivery'],
      priority: 5,
    },
  })

  // Create exchange rate
  const exchangeRate = await prisma.exchangeRate.create({
    data: {
      fromCurrency: 'USDT',
      toCurrency: 'IDR',
      rate: new Decimal(15500),
      provider: 'coingecko',
      timestamp: new Date(),
    },
  })

  // Create currency cache
  await prisma.currencyCache.create({
    data: {
      fromCurrency: 'USDT',
      toCurrency: 'IDR',
      rate: new Decimal(15500),
      provider: 'coingecko',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
    },
  })

  // Create expenses
  await prisma.expense.create({
    data: {
      description: 'Adobe Photoshop License - Monthly',
      category: 'SOFTWARE',
      amount: new Decimal(9.99),
      currency: 'USDT',
      amountUSDT: new Decimal(9.99),
      amountIDR: new Decimal(154755),
      exchangeRateId: exchangeRate.id,
      timelineEventId: task1.id,
      expenseDate: new Date('2024-01-10'),
      tags: ['software', 'monthly'],
    },
  })

  await prisma.expense.create({
    data: {
      description: 'Professional Cropping Tablet',
      category: 'HARDWARE',
      amount: new Decimal(299.99),
      currency: 'USDT',
      amountUSDT: new Decimal(299.99),
      amountIDR: new Decimal(4649850.5),
      exchangeRateId: exchangeRate.id,
      timelineEventId: task1.id,
      expenseDate: new Date('2024-01-08'),
      tags: ['hardware', 'equipment'],
    },
  })

  await prisma.expense.create({
    data: {
      description: 'Freelance Motion Designer - 20 hours',
      category: 'OUTSOURCING',
      amount: new Decimal(400),
      currency: 'USDT',
      amountUSDT: new Decimal(400),
      amountIDR: new Decimal(6200000),
      exchangeRateId: exchangeRate.id,
      timelineEventId: task2.id,
      expenseDate: new Date('2024-02-01'),
      tags: ['outsourcing', 'motion'],
    },
  })

  await prisma.expense.create({
    data: {
      description: 'DaVinci Resolve Studio License',
      category: 'SOFTWARE',
      amount: new Decimal(295),
      currency: 'USDT',
      amountUSDT: new Decimal(295),
      amountIDR: new Decimal(4572500),
      exchangeRateId: exchangeRate.id,
      expenseDate: new Date('2024-01-15'),
      tags: ['software', 'video-editing'],
    },
  })

  await prisma.expense.create({
    data: {
      description: 'Coffee & Snacks - Team Meeting',
      category: 'MISCELLANEOUS',
      amount: new Decimal(45.50),
      currency: 'USDT',
      amountUSDT: new Decimal(45.50),
      amountIDR: new Decimal(704750),
      exchangeRateId: exchangeRate.id,
      expenseDate: new Date('2024-01-20'),
      tags: ['miscellaneous', 'team'],
    },
  })

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
