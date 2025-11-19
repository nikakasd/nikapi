import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { TTLCache } from '@/shared/cache/ttl.js'
import env from '@/shared/env.js'
import lastfm from '@/shared/services/lastfm/index.js'
import { lastfmNowPlayingSchema } from './schema.js'

interface NowPlayingPayload {
  name: string
  artist: string
  album: string | null
  image: string | null
  url: string
}

const recentTracksCache = new TTLCache<string, NowPlayingPayload | null>(60_000)

export const lastfmProxyRouter = new OpenAPIHono()

lastfmProxyRouter.openapi(createRoute({
  method: 'get',
  path: '/now-playing',
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          schema: lastfmNowPlayingSchema,
        },
      },
    },
    204: {
      description: 'No content',
    },
  },
}), async (c) => {
  const cacheKey = env.modules.lastfm.username
  const cached = recentTracksCache.get(cacheKey)
  if (cached !== undefined) {
    if (cached === null)
      return new Response(null, { status: 204 })

    return c.json(cached)
  }

  try {
    const tracksResponse = await lastfm.getRecentTracks(cacheKey)

    if (!tracksResponse.recenttracks || !tracksResponse.recenttracks.track.length) {
      recentTracksCache.set(cacheKey, null)
      return new Response(null, { status: 204 })
    }

    const nowPlaying = tracksResponse.recenttracks.track.find((trackMeta: any) => trackMeta['@attr']?.nowplaying === 'true')

    if (!nowPlaying) {
      recentTracksCache.set(cacheKey, null)
      return new Response(null, { status: 204 })
    }

    const responsePayload: NowPlayingPayload = {
      name: nowPlaying.name,
      artist: nowPlaying.artist['#text'],
      album: nowPlaying.album['#text'] || null,
      image: nowPlaying.image.find((imageMeta: any) => imageMeta.size === 'medium')?.['#text'] || null,
      url: nowPlaying.url,
    }

    recentTracksCache.set(cacheKey, responsePayload)

    return c.json(responsePayload)
  }
  catch (error) {
    console.error(error)

    return c.json({
      code: 500,
      error: 'Internal server error',
    })
  }
})
