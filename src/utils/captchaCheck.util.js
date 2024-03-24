import axios from 'axios'

const captchaCheck = async (captcha) => {
   try {
      const secret = process.env.CLOUDFLARE_CAPTCHA_KEY
      if (!captcha) return false
      const response = await axios.post(
         'https://challenges.cloudflare.com/turnstile/v0/siteverify',
         {
            secret,
            response: captcha,
         }
      )
      if (response.data.success) return true
      return false
   } catch (error) {
      console.error(error)
      return false
   }
}

export default captchaCheck