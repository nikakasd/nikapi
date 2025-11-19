import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'
import env from 'env-var'

if (existsSync('.env'))
  loadEnvFile('.env')

export default {
  mode: env.get('NODE_ENV').default('production').asString(),
  databaseUrl: env.get('DATABASE_URL').required().asString(),
  web: {
    host: env.get('WEB_HOST').default('0.0.0.0').asString(),
    port: env.get('WEB_PORT').default('3000').asPortNumber(),
    jwtSecret: env.get('WEB_JWT_SECRET').required().asString(),
  },
  bot: {
    token: env.get('BOT_TOKEN').required().asString(),
    chatId: env.get('BOT_CHAT_ID').required().asInt(),
  },
  modules: {
    howwefeel: {
      refreshToken: env.get('HOWWEFEEL_REFRESH_TOKEN').required().asString(),
      userId: env.get('HOWWEFEEL_USER_ID').required().asString(),
    },
    lastfm: {
      apiKey: env.get('LASTFM_API_KEY').required().asString(),
      apiSecret: env.get('LASTFM_API_SECRET').required().asString(),
      token: env.get('LASTFM_TOKEN').required().asString(),
      username: env.get('LASTFM_USERNAME').required().asString(),
    },
  },
}
