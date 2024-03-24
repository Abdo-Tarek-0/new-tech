import UserModel from '../Modules/user/user.model.js'
import TwoFactorAuthServices from '../services/2FA.services.js'
import { catchError } from '../utils/catchAsyncError.js'
import { ErrorMessage } from '../utils/ErrorMessage.js'

const decider = async (user, req, res) => {
   const device = req.device
   const ip = device.ip

   user.twoFactorAuth.trustedIPs = user?.twoFactorAuth?.trustedIPs.filter(
      (p) => {
         return Date.now() - p.lastTimeUsed < 7 * 24 * 60 * 60 * 1000
      }
   )
   user.twoFactorAuth.trustedDevices =
      user?.twoFactorAuth?.trustedDevices.filter((d) => {
         if (d.id === device.id) {
            return d.userAgent === device.agent
         }
         return true
      })

   const trustedIPs = user?.twoFactorAuth?.trustedIPs
   const trustedDevices = user?.twoFactorAuth?.trustedDevices

   const trustedIP = trustedIPs.filter((p) => p?.ip === ip)?.[0]
   const trustedDevice = trustedDevices.filter((d) => d.id === device.id)?.[0]

   if (trustedIP && trustedDevice) return true

   if (trustedIP && !trustedDevice) {
      console.log('ip is trusted but device is not')

      if (user.twoFactorAuth.trustedDevices.length >= 5) {
         // sort by addAt
         user.twoFactorAuth.trustedDevices.sort((a, b) => a.addAt - b.addAt)
         // remove the oldest device
         user.twoFactorAuth.trustedDevices.shift()

         user.twoFactorAuth.trustedDevices.push({
            id: device.id,
            userAgent: device.agent,
         })
      } else {
         user.twoFactorAuth.trustedDevices.push({
            id: device.id,
            userAgent: device.agent,
         })
      }
      user.twoFactorAuth.trustedIPs = user.twoFactorAuth.trustedIPs.map((p) => {
         if (p.ip === ip) {
            p.lastTimeUsed = Date.now()
         }
         return p
      })

      await user.save()
      res.header('x-device-id', device.id)
      return true
   } else if (!trustedIP && trustedDevice) {
        console.log('device is trusted but ip is not')
        if (user.twoFactorAuth.trustedIPs.length >= 5) {
         // sort by lastTimeUsed
         user.twoFactorAuth.trustedIPs.sort((a, b) => a.lastTimeUsed - b.lastTimeUsed)
         // remove the oldest ip
         user.twoFactorAuth.trustedIPs.shift()

         user.twoFactorAuth.trustedIPs.push({
            ip: ip,
            lastTimeUsed: Date.now(),
         })
        } else {
            user.twoFactorAuth.trustedIPs.push({
                ip: ip,
                lastTimeUsed: Date.now(),
            })
        }

      await user.save()
      return true
   } else {
      return false
   }
}

export const login2FA = catchError(async (req, res, next) => {
   const { password, email } = req.body
   const user = await UserModel.findOne({ email: email }).select(
      'firstName lastName confirmEmail role _id email passwordChangedAt suspend tokenizer +twoFactorAuth.secret twoFactorAuth.enabled +twoFactorAuth.trustedIPs +twoFactorAuth.trustedDevices +password'
   )

   if (!user) throw new ErrorMessage(404, 'wrong email or password')
   if (!(await user.isCorrectPassowrd(password, user.password)))
      throw new ErrorMessage(404, 'wrong email or password')
   if (user.suspend)
      throw new ErrorMessage(401, 'sorry you have been suspended by admin')

   req.user = user
   if (!user?.twoFactorAuth?.enabled) return next()

   const isTrusted = await decider(user, req, res)
   if (isTrusted) return next()

   const code = req.body.code
   if (!code)
      throw new ErrorMessage(400, '2FA code is required', '2FA_CODE_REQUIRED')

   const isVerified = TwoFactorAuthServices.verifyTwoFactorAuth(
      code,
      user.twoFactorAuth.secret
   )

   if (!isVerified) throw new ErrorMessage(400, 'invalid code')

   user.twoFactorAuth.trustedIPs.push({
      ip: req.device.ip,
      lastTimeUsed: Date.now(),
   })
   user.twoFactorAuth.trustedDevices.push({
      id: req.device.id,
      userAgent: req.device.agent,
   })
   res.header('x-device-id', req.device.id)

   await user.save()

   return next()
})
