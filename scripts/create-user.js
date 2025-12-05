#!/usr/bin/env node

import bcrypt from 'bcryptjs';
import pg from 'pg';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const SALT_ROUNDS = 10;

async function createUser() {
  const username = process.argv[2] || 'adityabandi';
  const password = process.argv[3] || '228332';
  const role = process.argv[4] || 'admin';

  const id = crypto.randomUUID();
  const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // Check if user already exists
    const existing = await client.query('SELECT user_id FROM "user" WHERE username = $1', [
      username,
    ]);

    if (existing.rows.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`User "${username}" already exists with id: ${existing.rows[0].user_id}`);
      return;
    }

    // Create user
    await client.query(
      `INSERT INTO "user" (user_id, username, password, role, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [id, username, hashedPassword, role],
    );

    // eslint-disable-next-line no-console
    console.log(`✓ Created user "${username}" with role "${role}"`);
    // eslint-disable-next-line no-console
    console.log(`  ID: ${id}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating user:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createUser();
