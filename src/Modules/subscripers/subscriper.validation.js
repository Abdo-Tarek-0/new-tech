import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const addSubscriperSchema = joi
   .object({
      email: generalFields.email.required(),
   })
   .required()

export const addGetInTouchSchema = joi
   .object({
      email: generalFields.email.required(),
      phone: joi.string().min(5).required(),
      message: joi.string().min(5),
      name: joi.string().min(4),
      cfTurnstileToken: joi.string(),
   })
   .required()
export const broadcastSchema = joi
   .object({
      from: generalFields.email.required(),
      message: joi.string().min(5),
   })
   .required()
