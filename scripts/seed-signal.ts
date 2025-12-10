/* eslint-disable no-console */
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is missing');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // 1. Ensure User
    let user = await prisma.user.findFirst({ where: { username: 'admin' } });
    if (!user) {
      const password = await bcrypt.hash('password123', 10);
      user = await prisma.user.create({
        data: {
          id: 'a9d1b7e4-2f3a-4c5b-9d8e-7f6a5b4c3d2e',
          username: 'admin',
          password: password,
          role: 'admin',
        },
      });
      console.log('Created user: admin');
    }

    // 2. Ensure Website
    let website = await prisma.website.findFirst({ where: { name: 'Signal Test' } });
    if (!website) {
      website = await prisma.website.create({
        data: {
          id: 'b8c9d0e1-3f4a-5b6c-7d8e-9f0a1b2c3d4e',
          name: 'Signal Test',
          userId: user.id,
          domain: 'localhost',
        },
      });
      console.log('Created website: Signal Test');
    }

    console.log('WEBSITE_ID=' + website.id);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
