import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const storeAttachment = joi.object({
   file: generalFields.file, // file form-data
})

export const deleteAttachment = joi.object({
   id: generalFields.id, // param
})
