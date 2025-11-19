import type { Ffetch } from '@fuman/fetch'
import type { Group } from './types.js'
import { ffetchBase } from '@fuman/fetch'
import env from '@/shared/env.js'

function parseFirestoreValue(field: any) {
  if (!field)
    return null

  if (field.stringValue !== undefined)
    return field.stringValue
  if (field.integerValue !== undefined)
    return Number.parseInt(field.integerValue)
  if (field.doubleValue !== undefined)
    return field.doubleValue
  if (field.booleanValue !== undefined)
    return field.booleanValue
  if (field.timestampValue !== undefined)
    return field.timestampValue
  if (field.nullValue !== undefined)
    return null

  if (field.arrayValue) {
    return field.arrayValue.values?.map((v: any) => parseFirestoreValue(v)) || []
  }

  if (field.mapValue) {
    const obj: any = {}
    for (const [key, value] of Object.entries(field.mapValue.fields || {})) {
      obj[key] = parseFirestoreValue(value)
    }
    return obj
  }

  return null
}

function parseDocument(doc: any) {
  const parsed: any = {}
  for (const [key, value] of Object.entries(doc.fields)) {
    parsed[key] = parseFirestoreValue(value)
  }
  return parsed
}

export interface HowWeFeelOptions {
  refreshToken: string
  userId: string
}

export class HowWeFeelService {
  private static readonly PROJECT_ID = 'howwefeel'
  private static readonly APP_CHECK_TOKEN = 'eyJlcnJvciI6IlVOS05PV05fRVJST1IifQ=='
  private static readonly FIREBASE_TOKEN = 'AIzaSyCq7GOUb9YwKTZ7qizNJ7KHVUPlZV1p__A'

  private accessTokenString: string | null = null
  private accessTokenExpiration: Date | null = null
  private fetch: Ffetch<object, object>

  constructor(private options: HowWeFeelOptions) {
    this.fetch = ffetchBase.extend({
      baseUrl: `https://firestore.googleapis.com/v1/projects/${HowWeFeelService.PROJECT_ID}`,
      headers: {
        'Accept': 'application/json',
        'X-Firebase-AppCheck': HowWeFeelService.APP_CHECK_TOKEN,
      },
    })
  }

  get accessToken() {
    if (!this.accessTokenString)
      return null
    if (this.accessTokenExpiration && (Date.now() > this.accessTokenExpiration.getTime())) {
      this.accessTokenString = null
      return null
    }

    return this.accessTokenString
  }

  setAccessToken(token: string, expiresIn: number) {
    this.accessTokenString = token
    this.accessTokenExpiration = new Date(Date.now() + (expiresIn * 1000))
  }

  async fetchGroups(): Promise<Group[]> {
    if (!this.accessToken) {
      await this.refreshAccessToken()
    }

    const response = await this.fetch('/databases/(default)/documents:runQuery', {
      validateResponse: () => true,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      json: {
        structuredQuery: {
          from: [{ collectionId: 'groups' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'memberIds' },
              op: 'ARRAY_CONTAINS',
              value: { stringValue: this.options.userId },
            },
          },
        },
      },
    }).json<{ document: any }[]>()

    return response.map(doc => parseDocument(doc.document)) as Group[]
  }

  async fetchMyCheckin() {
    const groups = await this.fetchGroups()

    const myCheckins = groups
      .filter(group => group.checkIns && group.checkIns[this.options.userId])
      .map(group => group.checkIns[this.options.userId])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return myCheckins[0] ?? null
  }

  async refreshAccessToken() {
    const response = await ffetchBase(`https://securetoken.googleapis.com/v1/token`, {
      method: 'POST',
      query: {
        key: HowWeFeelService.FIREBASE_TOKEN,
      },
      form: {
        grant_type: 'refresh_token',
        refresh_token: this.options.refreshToken,
      },
    }).json<{ access_token: string, expires_in: number }>()

    this.setAccessToken(response.access_token, response.expires_in)
    return response.access_token
  }
}

export default new HowWeFeelService({
  refreshToken: env.modules.howwefeel.refreshToken,
  userId: env.modules.howwefeel.userId,
})
