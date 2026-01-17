import type { Config } from 'drizzle-kit';

export default {
  schema: './node_modules/@packages/db/dist/schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
