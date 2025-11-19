import { z } from '@hono/zod-openapi'

export const lastfmNowPlayingSchema = z.object({
  name: z.string(),
  artist: z.string(),
  album: z.string().nullable(),
  image: z.string().nullable(),
  url: z.string(),
})
