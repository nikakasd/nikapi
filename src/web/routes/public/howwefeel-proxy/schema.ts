import { z } from '@hono/zod-openapi'

export const howWeFeelCheckinSchema = z.object({
  mood: z.object({
    id: z.uuid(),
    name: z.string(),
    description: z.string().nullable(),
    pleasantness: z.float32().nullable(),
    energy: z.float32().nullable(),
  }),
  tags: z.array(z.string()),
  createdAt: z.string(),
})
