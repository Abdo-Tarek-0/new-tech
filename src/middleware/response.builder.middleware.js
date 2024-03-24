const resBuilderMiddleware = () => (req, res, next) => {
   res.build = (
      status = 200,
      message = '',
      data = null,
      additionalInfo = {}
   ) =>
      res.status(status).json({
         status: status < 400 ? 'success' : status < 500 ? 'fail' : 'error',
         requestId: req.id,
         message,
         ...additionalInfo,
         data,
      })

   return next()
}

export default resBuilderMiddleware