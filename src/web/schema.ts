import {z} from "@hono/zod-openapi";

export const genericErrorSchema = z.object({
  code: z.number().openapi({ description: 'HTTP Code', example: 500 }),
  error: z.string().openapi({ description: 'Error description', example: 'Something went wrong' })
})