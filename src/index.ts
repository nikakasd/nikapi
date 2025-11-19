import { serve } from '@hono/node-server'
import { bot } from './bot/index.js'
import env from './shared/env.js'
import { app } from './web/index.js'

await bot.start()
serve({
  fetch: app.fetch,
  hostname: env.web.host,
  port: env.web.port,
})
