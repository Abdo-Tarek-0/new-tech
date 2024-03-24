/**
 * @description error builder
 * @param {string} message - Error message
 * @param {number} statusCode - response status code
 * @param {string} code - Error code
 * @returns {Error} - the error object
 * @example ErrorBuilder('Invalid email or password', 401, 'INVALID_CREDENTIALS')
 */
export class ErrorMessage extends Error {
   constructor(statusCode, message, code, data) {
      super()
      this.code = code || null
      this.statusCode = statusCode || 500
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
      this.isOperational = true
      this.message = message || 'Something went wrong'
      this.data = data || null

      Error.captureStackTrace(this, this.constructor)
   }

   static CODES = {
      NOTFOUND: 'NOT_FOUND',
      INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
      UPLOAD: 'UPLOAD_ERROR',
      MEDIA_PARSING: 'MEDIA_PARSING_ERROR',
      FFMPEG: 'FFMPEG_ERROR',
      EMAIL_IS_NOT_ACTIVE: 'EMAIL_IS_NOT_ACTIVE',
   }
}