import { CacheManager } from '../../services/cache.services/CacheManger.js'
import CacheMiddleware from '../../middleware/cacheMiddlewares.js'

const cache = new CacheMiddleware(new CacheManager(), { ttl: 60 * 30 })

export default cache
