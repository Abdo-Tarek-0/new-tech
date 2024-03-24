import UserModel from '../Modules/user/user.model.js'
import { catchError } from '../utils/catchAsyncError.js'
import { verifyToken } from '../utils/GenerateAndVerifyToken.js'
import { ErrorMessage } from '../utils/ErrorMessage.js'

const authorizedTo = (...roles) =>
   catchError(async (request, response, next) => {
      const { authorization } = request.headers
      if (!authorization?.startsWith(process.env.BEARER_KEY)) {
         throw new ErrorMessage(401, `In-valid bearer key`)
      }
      const token = authorization.split(' ')[1]

      if (!token) {
         throw new ErrorMessage(401, `In-valid token`)
      }

      const decoded = verifyToken({ token })

      if (!decoded?.id) {
         throw new ErrorMessage(401, `In-valid token payload`)
      }

      const user = await UserModel.findById(decoded.id).select(
         'firstName lastName role _id email passwordChangedAt suspend tokenizer +twoFactorAuth.secret twoFactorAuth.enabled +twoFactorAuth.trustedIPs +twoFactorAuth.trustedDevices'
      )

      if (!user) {
         throw new ErrorMessage(401, `not registered user`)
      }
      if (user.suspend) {
         throw new ErrorMessage(401, `you have been suspended by admin `)
      }
      if (user.passwordChangedAt) {
         const passwordTimeInMinutes = Number(
            user.passwordChangedAt.getTime() / 1000
         )

         if (passwordTimeInMinutes > Number(decoded.iat)) {
            throw new ErrorMessage(401, `expired Token`)
         }
      }
      if (decoded.tokenizer !== user.tokenizer) {
         throw new ErrorMessage(401, `In-valid token`)
      }
      request.decoded = user
      request.user = user
      console.log('User', user)
      if (roles.includes(request.decoded.role)) {
         next()
      } else {
         throw new ErrorMessage(401, 'not authorized ')
      }
   })

export const checkSameUser = (opt) =>
   catchError(async (request, response, next) => {
      const { id: userIdFromToken } = request.decoded
      const { userId, id } = request.params
      if (opt?.ignoreIfAdmin && request.decoded.role === 'admin') return next()

      if (userIdFromToken === userId || userIdFromToken === id) {
         next()
      } else {
         throw new ErrorMessage(401, 'not authorized ')
      }
   })

export default authorizedTo

// export const isAllowTo = (...roles) => {
//   return async (request, response, next) => {
//     auth(request, response, () => {
//       if (roles.includes(request.decoded.role)) {
//         console.log(request.decoded);
//         next();
//       } else {
//         next();
//       }
//     });
//   };
// };
