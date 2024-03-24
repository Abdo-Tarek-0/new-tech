import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const createOrderSchema = joi
   .object({
      title: joi.string().min(5).required(),
      totalPrice: joi.number().min(1).required,
      service: generalFields.id.required(),
   })
   .required()

export const getOrderSchema = joi
   .object({
      orderId: generalFields.id.required(),
   })
   .required()

export const cancelOrderSchema = joi.object({
   orderId: generalFields.id.required(),
})

export const deleteOrderSchema = joi
   .object({
      orderId: generalFields.id.required(),
   })
   .required()
export const updateOrderStatusSchema = joi
   .object({
      id: generalFields.id.required(),
      status: joi
         .string()
         .valid(
            'recieved',
            'gathering-information',
            'on-progress',
            'completed'
         ),
   })
   .required()

export const addWorkStatusToOrderSchema = joi
   .object({
      id: generalFields.id.required(),
      workStatus: joi.object({
         title: joi.string().min(3).required(),
         completed: joi.boolean().required(),
         description: joi.string().min(5).required(),
      }),
   })
   .required()
export const updateWorkStatusforOrderSchema = joi
   .object({
      id: generalFields.id.required(),
      _id: generalFields.id.required(),
      title: joi.string().min(3).required(),
      completed: joi.boolean().required(),
      description: joi.string().min(5).required(),
   })
   .required()

export const removeOneWorkStatusforOrderSchema = joi
   .object({
      id: generalFields.id.required(),
      _id: generalFields.id.required(),
   })
   .required()
