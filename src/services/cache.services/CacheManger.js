import NodeCache from 'node-cache'

class CacheManager {
   constructor() {
      this.cache = new NodeCache()
   }

   set(key, value, ttl = 0) {
      this.cache.set(key, value, ttl)
   }

   get(key) {
      return this.cache.get(key)
   }

   del(key) {
      this.cache.del(key)
   }

   flush() {
      this.cache.flushAll()
   }
}

const globalCache = new CacheManager()

export { globalCache, CacheManager }
