import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { StatusService } from '@/shared/services/status/index.js'
import { statusSchema } from '../../public/status/schema.js'

export const statusRouter = new OpenAPIHono()

statusRouter.openapi(createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: statusSchema.omit({ createdAt: true }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Status saved',
    },
  },
}), async (c) => {
  try {
    await StatusService.set(c.req.valid('json'))
    return new Response(null, { status: 201 })
  }
  catch (err) {
    console.error(err)

    return c.json({
      code: 500,
      error: 'Failed to save status',
    }, { status: 500 })
  }
})
