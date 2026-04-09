import 'dotenv/config';
import type { Config } from 'drizzle-kit';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is required. Set it in .env (single source of truth for DB credentials).',
  );
}

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
  verbose: true,
  strict: true,
} satisfies Config;
