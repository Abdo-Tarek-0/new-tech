import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const addCategory = joi
   .object({
      title: joi.string().min(2).required(),
      description: joi.string().required(),
      image: generalFields.file.required(),
      icon: generalFields.file.required(),
   })
   .required()
export const updateCategory = joi
   .object({
      id: generalFields.id.optional(),
      title: joi.string().min(2),
      icon: generalFields.file.optional(),
      description: joi.string(),
      image: generalFields.file.optional(),
   })
   .optional()
export const deleteCategory = joi
   .object({
      id: generalFields.id.optional(),
   })
   .optional()
