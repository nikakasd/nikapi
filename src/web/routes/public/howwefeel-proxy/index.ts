import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { TTLCache } from '@/shared/cache/ttl.js'
import howwefeel from '@/shared/services/howwefeel/index.js'
import { howWeFeelCheckinSchema } from './schema.js'

export const howWeFeelProxyRouter = new OpenAPIHono()
const moodMetadata = await readFile(join(cwd(), 'static', 'moods.json'), 'utf-8').then(f => JSON.parse(f))
const latestCheckinCache = new TTLCache<'latest', ReturnType<typeof buildResponse> | null>(5 * 60 * 1000)

function buildResponse(checkin: Awaited<ReturnType<typeof howwefeel.fetchMyCheckin>>) {
  if (!checkin)
    return null

  const moodMeta = moodMetadata[checkin.moodId]

  return {
    mood: {
      id: checkin.moodId,
      name: checkin.moodName,
      description: moodMeta?.description || null,
      pleasantness: moodMeta?.pleasantness ? Number.parseFloat(moodMeta.pleasantness.toFixed(2)) : null,
      energy: moodMeta?.energy ? Number.parseFloat(moodMeta.energy.toFixed(2)) : null,
    },
    tags: checkin.tags,
    createdAt: checkin.createdAt,
  }
}

howWeFeelProxyRouter.openapi(createRoute({
  method: 'get',
  path: '/latest-checkin',
  responses: {
    204: { description: 'No content' },
    200: {
      content: {
        'application/json': {
          schema: howWeFeelCheckinSchema,
        },
      },
      description: '',
    },
  },
}), async (c) => {
  const cached = latestCheckinCache.get('latest')
  if (cached !== undefined) {
    if (cached === null)
      return new Response(null, { status: 204 })

    return c.json(cached)
  }

  const checkin = await howwefeel.fetchMyCheckin()
  const response = buildResponse(checkin)

  latestCheckinCache.set('latest', response)

  if (!response)
    return new Response(null, { status: 204 })

  return c.json(response)
})
