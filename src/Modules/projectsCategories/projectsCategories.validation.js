import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const addCategory = joi
   .object({
      title: joi.string().min(2).required(),
   })
   .required()
export const updateCategory = joi
   .object({
      id: generalFields.id.optional(),
      title: joi.string().min(2),
   })
   .optional()
export const deleteCategory = joi
   .object({
      id: generalFields.id.optional(),
   })
   .optional()
