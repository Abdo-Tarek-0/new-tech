const catchError = (fn) => (request, response, next) => {
   fn(request, response, next).catch((error) => {
      next(error)
   })
}
const catchSocketError = () => () => {
   // handle socket error
}
export { catchError, catchSocketError }
