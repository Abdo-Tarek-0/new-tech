class CacheMiddleware {
   constructor(cache, opt) {
      this.cacheProvider = cache
      this.opt = opt
   }

   /**
    *
    * @param {import("express").Request} req
    * @param {import("express").Response} res
    * @param {import("express").NextFunction} next
    * @returns
    */
   cacheMiddleware = (req, res, next) => {
      const key = this.constructKey(req)
      const cachedData = this.cacheProvider.get(key)

      if (req.method !== 'GET') {
         return next()
      }

      if (!req.accepts('json')) {
         return next()
      }

      if (cachedData) {
         return res.json(cachedData)
      }
      res.sendResponse = res.json
      res.json = (body) => {
         if (res.statusCode === 200)
            this.cacheProvider.set(key, body, this.opt?.ttl || 60)

         res.sendResponse(body)
      }
      next()
   }

   /**
    * 
    * @param {import("express").Request} req 
    * @returns {string}
    * @description This method is used to construct the key for the cache
    * @override
    */
   constructKey = (req) => {
      return req.originalUrl
   }

   flush = () => {
      this.preFlushCache()
      this.cacheProvider.flush()
   }

   flushMiddleware = (req, res, next) => {
      this.flush()
      next()
   }

   /**
    *
    * @override
    * @description This method is called before the cache is flushed (overridable method)
    */
   preFlushCache = () => {}
}

export default CacheMiddleware
