import { getConnInfo } from '@hono/node-server/conninfo'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { ShoutboxService } from '@/shared/services/shoutbox/index.js'
import { shoutboxMessageSchema } from './schema.js'

export const shoutboxRouter = new OpenAPIHono()

shoutboxRouter.openapi(createRoute({
  method: 'get',
  path: '/',
  request: {
    query: z.object({
      limit: z.coerce.number().min(1).max(100).optional(),
      offset: z.coerce.number().min(0).optional(),
    }),
  },
  responses: {
    200: {
      description: '',
      content: {
        "application/json": {
          schema: z.object({
            messages: z.array(shoutboxMessageSchema),
            hasNextPage: z.boolean(),
          }),
        }
      }
    },
  },
}), async (c) => {
  try {
    const { limit, offset } = c.req.valid('query')

    const { messages, hasNextPage } = await ShoutboxService.getMessages(limit, offset)
    return c.json({
      messages,
      hasNextPage,
    }) as any
  }
  catch (err) {
    console.error(err)
    return c.json({
      code: 500,
      error: 'Failed to get messages',
    }, { status: 500 })

  }
})

shoutboxRouter.openapi(createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      required: true,
      description: '',
      content: {
        'application/json': {
          schema: z.object({
            content: z.string().min(1).max(4000),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Message sent',
    },
  },
}), async (c) => {
  try {
    const info = getConnInfo(c)
    await ShoutboxService.addMessage(c.req.valid('json').content, info?.remote.address)

    return new Response(null, { status: 201 })
  }
  catch (err) {
    console.error(err)
    return c.json({
      code: 500,
      error: 'Failed to send message',
    }, { status: 500 })
  }
})
