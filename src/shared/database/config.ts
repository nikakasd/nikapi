import { existsSync } from 'node:fs'
import { env, loadEnvFile } from 'node:process'
import { defineConfig } from 'drizzle-kit'

if (existsSync('.env'))
  loadEnvFile('.env')

export default defineConfig({
  out: './drizzle',
  schema: './src/shared/database/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL ?? '',
  },
})
