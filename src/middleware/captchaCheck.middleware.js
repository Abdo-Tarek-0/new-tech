import captchaCheck from '../utils/captchaCheck.util.js'

const captchaCheckMiddleware = async (req, res, next) => {
   try {
      if (process.env.MOOD === 'DEV') return next()
      const { cfTurnstileToken: captcha } = req.body

      if (!captcha) {
         return res.status(400).json({
            message: 'Please solve the captcha',
         })
      }

      const isValidCaptcha = await captchaCheck(captcha)

      if (!isValidCaptcha) {
         return res.status(400).json({
            message: 'Invalid captcha',
         })
      }

      delete req.body.cfTurnstileToken
      next()
   } catch (error) {
      res.status(500).json({ message: error.message })
   }
}

export default captchaCheckMiddleware
