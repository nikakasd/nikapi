import { OpenAPIHono } from '@hono/zod-openapi'
import { howWeFeelProxyRouter } from './howwefeel-proxy/index.js'
import { lastfmProxyRouter } from './lastfm-proxy/index.js'
import { statusRouter } from './status/index.js'

export const publicRouter = new OpenAPIHono()

publicRouter.route('/howwefeel-proxy', howWeFeelProxyRouter)
publicRouter.route('/lastfm-proxy', lastfmProxyRouter)
publicRouter.route('/status', statusRouter)
