import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { StatusService } from '@/shared/services/status/index.js'
import { statusSchema } from './schema.js'

export const statusRouter = new OpenAPIHono()

statusRouter.openapi(createRoute({
  method: 'get',
  path: '/',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: statusSchema,
        },
      },
      description: 'Status response',
    },
    204: {
      description: 'No content',
    },
  },
}), async (c) => {
  const status = await StatusService.get()

  if (!status) {
    return new Response(null, { status: 204 })
  }

  return c.json(status)
})
