import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const signUpSchema = joi
   .object({
      firstName: joi.string().min(3).max(20).required(),
      lastName: joi.string().min(3).max(20).required(),
      email: generalFields.email.required(),
      password: generalFields.password.required(),
      // country: joi.string(),
      // cPassword: generalFields.cPassword.valid(joi.ref("password")),
      file: generalFields.file,

      phone: joi.string(),
   })
   .required()

export const signInSchema = joi
   .object({
      email: generalFields.email.required(),
      password: generalFields.password.required(),
      code: joi.string(),
   })
   .required()
export const tokenSchema = joi
   .object({
      token: joi.string().required(),
      isRedirect: joi.string(),
   })
   .required()

export const forgetPasswordSchema = joi
   .object({
      email: generalFields.email.required(),
      password: generalFields.password.required(),
      cPassword: generalFields.cPassword.valid(joi.ref('password')),
      resetCode: joi.string().length(5).required(),
   })
   .required()

export const sendVerificationCodeSchema = joi
   .object({
      email: generalFields.email.required(),
   })
   .required()

export const changePasswordSchema = joi
   .object({
      // email: generalFields.email.required(),
      password: generalFields.password.required(),
      oldPassword: joi.string().required(),
      cPassword: generalFields.cPassword.valid(joi.ref('password')),
   })
   .required()

export const requestChangeEmailSchema = joi
   .object({
      email: generalFields.email.required(),
      password: joi.string().min(5).required(),
   })
   .required()

export const enable2FASchema = joi
   .object({
      code: joi.string().required(),
   })
   .required()

export const disable2FASchema = joi
   .object({
      code: joi.string().required(),
   })
   .required()