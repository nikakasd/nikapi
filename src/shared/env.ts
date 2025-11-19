import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'
import env from 'env-var'

if (existsSync('.env'))
  loadEnvFile('.env')

export default {
  mode: env.get('NODE_ENV').default('production').asString(),
  web: {
    host: env.get('WEB_HOST').default('0.0.0.0').asString(),
    port: env.get('WEB_PORT').default('3000').asPortNumber(),
    jwtSecret: env.get('WEB_JWT_SECRET').required().asString(),
  },
  modules: {
    howwefeel: {
      refreshToken: env.get('HOWWEFEEL_REFRESH_TOKEN').required().asString(),
      userId: env.get('HOWWEFEEL_USER_ID').required().asString(),
    },
  },
}
