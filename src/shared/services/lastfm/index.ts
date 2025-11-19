import type { LastFmOptions } from './types.js'
import { createHash } from 'node:crypto'
import env from '@/shared/env.js'

export class LastFmService {
  constructor(private readonly options: LastFmOptions) {}

  makeSignature(params: any) {
    const filteredParams = Object.entries(params)
      .filter(([key]) => key !== 'format')
      .sort(([a], [b]) => a.localeCompare(b))

    let concatenated = ''
    for (const [key, value] of filteredParams) {
      concatenated += key + value
    }
    concatenated += this.options.apiSecret

    const md5 = createHash('md5').update(concatenated, 'utf8').digest('hex').toUpperCase()
    return md5
  }

  request(method: string, params: any, httpMethod: string = 'GET') {
    const signature = this.makeSignature({
      method,
      api_key: this.options.apiKey,
      sk: this.options.token,
      ...params,
    })

    const url = new URL('https://ws.audioscrobbler.com/2.0/')
    url.searchParams.set('method', method)
    url.searchParams.set('api_key', this.options.apiKey)
    url.searchParams.set('format', 'json')
    url.searchParams.set('api_sig', signature)
    url.searchParams.set('sk', this.options.token)

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value as string)
    }

    return fetch(url, {
      method: httpMethod,
    }).then(r => r.json())
  }

  // TODO: Make typings
  getRecentTracks(username: string) {
    return this.request('user.getRecentTracks', {
      user: username,
    })
  }
}

export default new LastFmService({
  apiKey: env.modules.lastfm.apiKey,
  apiSecret: env.modules.lastfm.apiSecret,
  token: env.modules.lastfm.token,
})
