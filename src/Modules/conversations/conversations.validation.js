import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const getAll = joi
   .object({
      userId: generalFields.id.required(),
   })
   .required()

export const openConversation = joi
   .object({
      userId: generalFields.id.required(),
      order: generalFields.id.required(),
   })
   .required()

export const makeConvoMessagesSeen = joi
   .object({
      userId: generalFields.id.required(),
      convId: generalFields.id.required(),
   })
   .required()

export const adminMakeConvoMessagesSeen = joi
   .object({
      convId: generalFields.id.required(),
   })
   .required()

export const getUnseenConversations = joi
   .object({
      userId: generalFields.id.required(),
   })
   .required()

export const addNote = joi
   .object({
      userId: generalFields.id.required(),
      convId: generalFields.id.required(),
      content: joi.string().required(),
   })
   .required()
