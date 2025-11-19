import { OpenAPIHono } from '@hono/zod-openapi'
import { statusRouter } from './status/index.js'

export const privateRouter = new OpenAPIHono()

privateRouter.route('/status', statusRouter)
