import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const createUserSchema = joi
   .object({
      firstName: joi.string().min(3).max(20).required(),
      lastName: joi.string().min(3).max(20).required(),
      email: generalFields.email.required(),
      password: generalFields.password.required(),
      country: joi.string(),
      role: joi.string().valid('user', 'tech', 'admin').required(),
      // cPassword: generalFields.cPassword.valid(joi.ref("password")),
      file: generalFields.file,
      phone: joi.string().max(15),
   })
   .required()

export const changeUserPassword = joi
   .object({
      id: generalFields.id.required(),
      password: generalFields.password.required(),
   })
   .required()

export const findSingleUser = joi
   .object({
      id: generalFields.id.required(),
   })
   .required()
export const updateUserSchema = joi
   .object({
      id: generalFields.id.required(),
      firstName: joi.string().min(3).max(10),
      lastName: joi.string().min(3).max(10),
      email: generalFields.email.required(),

      country: joi.string(),
      role: joi.string().valid('user', 'tech', 'admin'),

      file: generalFields.file,
      phone: joi.string().max(15),
   })
   .required()

export const suspendUsers = joi
   .object({ ids: joi.array().items(generalFields.id.required()) })
   .required()
export const deleteUsers = joi
   .object({ ids: joi.array().items(generalFields.id.required()) })
   .required()

export const updateContactInfoSchema = joi
   .object({
      id: generalFields.id.required(),
      firstName: joi.string().min(3).max(10),
      lastName: joi.string().min(3).max(10),
      address: joi.string(),
      country: joi.string(),
      city: joi.string(),
   })
   .required()

export const changeProfileImageSchema = joi.object({
   file: generalFields.file,
})

export const changeBasicInfoSchema = joi.object({
   firstName: joi.string().min(3).max(10),
   lastName: joi.string().min(3).max(10),
   country: joi.string(),
   role: joi.string().valid('user', 'tech', 'admin'),
   phone: joi.string().max(15),
})
