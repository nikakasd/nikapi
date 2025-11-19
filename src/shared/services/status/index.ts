import type { Status } from './types.js'
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { TTLCache } from '@/shared/cache/ttl.js'

export class StatusService {
  private static readonly STATUS_PATH = join(cwd(), 'status.json')
  private static readonly cache = new TTLCache<'status', Status | null>(1 * 60 * 1000)

  static async get() {
    const cached = this.cache.get('status')
    if (cached !== undefined)
      return cached

    if (!existsSync(StatusService.STATUS_PATH))
      return this.cache.set('status', null)

    const status = await readFile(StatusService.STATUS_PATH, 'utf8')
    const parsed = JSON.parse(status) as Status

    this.cache.set('status', parsed)
    return parsed
  }

  static async set(newStatus: Omit<Status, 'createdAt'>) {
    const status = {
      ...newStatus,
      createdAt: new Date().toISOString(),
    }

    await writeFile(StatusService.STATUS_PATH, JSON.stringify(status, null, 2))
    this.cache.set('status', status)
    return status
  }
}
