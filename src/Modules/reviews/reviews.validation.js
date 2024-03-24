import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const addReview = joi
   .object({
      csName: joi.string().required(),
      csJobTitle: joi.string().required(),
      review: joi.string().required(),
      rating: joi.number().min(0).max(5).required(),
      image: generalFields.file.required(),
   })
   .required()
export const updateReview = joi
   .object({
      reviewId: generalFields.id.required(),
      csName: joi.string(),
      csJobTitle: joi.string(),
      review: joi.string(),
      rating: joi.number().min(0).max(5),
      image: generalFields.file,
   })
   .required()

export const deleteReview = joi
   .object({
      reviewId: generalFields.id.required(),
   })
   .required()
