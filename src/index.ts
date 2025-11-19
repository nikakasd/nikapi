import { serve } from '@hono/node-server'
import env from './shared/env.js'
import { app } from './web/index.js'

serve({
  fetch: app.fetch,
  hostname: env.web.host,
  port: env.web.port,
})
