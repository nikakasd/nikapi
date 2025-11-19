import { z } from "@hono/zod-openapi";

export const shoutboxMessageSchema = z.object({
  id: z.number(),
  content: z.string(),
  reply: z.string().nullable(),
  createdAt: z.string(),
})