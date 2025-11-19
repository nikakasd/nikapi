import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import env from '@/shared/env.js'
import { privateRouter } from './routes/private/index.js'
import { publicRouter } from './routes/public/index.js'

export const app = new OpenAPIHono()

app.use(cors())

app.use('/private/*', jwt({
  secret: env.web.jwtSecret,
  verification: {
    exp: true,
    iat: true,
  },
}))

app.route('/public', publicRouter)
app.route('/private', privateRouter)

app.doc31('/openapi.json', {
  openapi: '3.1.0',
  info: {
    version: '1.0.0',
    title: 'nika.gay API',
  },
})

app.get('/swagger-ui', swaggerUI({
  url: '/openapi.json',
}))
