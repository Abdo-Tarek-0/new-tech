import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const addNewMessage = joi
   .object({
      content: joi.string(),
      conversation: generalFields.id.required(),
      attachments: joi.array().items(generalFields.id),
   })
   .required()

export const adminAddNewMessage = joi
   .object({
      content: joi.string(),
      conversation: generalFields.id.required(),
      attachments: joi.array().items(generalFields.id),
   })
   .required()

export const getConvoMessages = joi
   .object({
      // userId: generalFields.id.required(),
      convId: generalFields.id.required(),
      messageId: generalFields.id,
      dir: joi.string().valid('next', 'prev'),
   })
   .required()

export const getAdminConvoMessages = joi
   .object({
      convId: generalFields.id.required(),
      messageId: generalFields.id,
      dir: joi.string().valid('next', 'prev'),
   })
   .required()

export const getMediaAndLinks = joi
   .object({
      convId: generalFields.id.required(),
      type: joi.string().valid('all', 'media', 'links'),
   })
   .required()
export const searchMessages = joi
   .object({
      convId: generalFields.id.required(),
      query: joi.string().min(2).max(5000).required(),
   })
   .required()

export const getSearchedMessage = joi
   .object({
      convId: generalFields.id.required(),
      messageId: generalFields.id.required(),
   })
   .required()
