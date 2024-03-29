import jwt from 'jsonwebtoken'

export const generateToken = ({
   payload = {},
   signature = process.env.TOKEN_SIGNATURE,
   expiresIn = 60 * 60,
} = {}) => {
   const token = jwt.sign(payload, signature, {
      expiresIn: Number(expiresIn),
   })

   return token
}

export const verifyToken = ({
   token,
   signature = process.env.TOKEN_SIGNATURE,
   ignoreExpiration = false,
} = {}) => {
   const decoded = jwt.verify(token, signature, {
      ignoreExpiration,
   })
   return decoded
}

export const tokenHelpers = {
   isTokenExpired(exp) {
      return Date.now() >= exp * 1000
   },
   isTokenizerCorrect(decoded, tokenizer) {
      return decoded.tokenizer === tokenizer
   },
   standerDuration: {
      auth: 60 * 60 * 24, // 24 hours
      refresh: 60 * 60 * 24 * 3,
      refreshKeepMeLoggedIn: 60 * 60 * 24 * 7,

      requestConfirmEmail: 60 * 60,
      requestNewConfirmEmail: 60 * 60 * 24 * 30,
      requestChangeEmail: 60 * 60,
   }
}
