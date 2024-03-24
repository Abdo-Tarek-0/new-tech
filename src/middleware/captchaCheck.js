import axios from 'axios'

const captchaCheck = async (req, res, next) => {
   try {
      if(process.env.mood === 'DEV') return next()
      const { cfTurnstileToken: captcha } = req.body
      const secret = process.env.CLOUDFLARE_CAPTCHA_KEY
      if (!captcha) {
         return res.status(400).json({
            message: "Please solve the captcha"
         })
      }


      const response = await axios.post(
         'https://challenges.cloudflare.com/turnstile/v0/siteverify',
         {
            secret,
            response: captcha,
         }
      )
      if (response.data.success) {
         delete req?.body?.cfTurnstileToken

         next()
      } else {
         res.status(400).json({ message: 'Captcha is not valid' })
      }
   } catch (error) {
      res.status(500).json({ message: error.message })
   }
}

export default captchaCheck
