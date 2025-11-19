interface CacheEntry<V> {
  value: V
  expiresAt: number
}

export class TTLCache<K, V> {
  private readonly store = new Map<K, CacheEntry<V>>()

  constructor(private readonly ttlMs: number) {}

  get(key: K): V | undefined {
    const entry = this.store.get(key)
    if (!entry)
      return undefined

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return undefined
    }

    return entry.value
  }

  set(key: K, value: V) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    })
    return value
  }

  delete(key: K) {
    this.store.delete(key)
  }

  clear() {
    this.store.clear()
  }
}
