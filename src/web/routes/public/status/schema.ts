import { z } from '@hono/zod-openapi'

export const statusSchema = z.object({
  status: z.string(),
  icon: z.string().nullable(),
  createdAt: z.string(),
})
