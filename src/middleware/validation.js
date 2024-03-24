import joi from 'joi'
import { Types } from 'mongoose'
import { ErrorMessage } from '../utils/ErrorMessage.js'

const validateObjectId = (value, helper) =>
   Types.ObjectId.isValid(value) ? true : helper.message('In-valid objectId')

export const generalFields = {
   email: joi.string(),
   // .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
   password: joi
      .string()
      .pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
      .required(),
   cPassword: joi.string().required(),
   id: joi.string().custom(validateObjectId),
   file: joi.object({
      size: joi.number().positive().required(),
      path: joi.string().required(),
      filename: joi.string().required(),
      destination: joi.string().required(),
      mimetype: joi.string().required(),
      encoding: joi.string().required(),
      originalname: joi.string().required(),
      fieldname: joi.string().required(),
      dest: joi.string().required(),
   }),
}

export const validation = (schema, opts) => (request, response, next) => {
   // console.log("files", request.body);
   // console.log(request.params);
   const transformationsErrors = []
   const inputs = {
      ...request.body,
      ...request.params,
      ...request.query,
   }
   if (request.file) {
      inputs.file = request.file
   } else if (request.files) {
      Object.keys(request.files).forEach((file) => {
         ;[inputs[file]] = request.files[file]
      })
   }
   if (opts?.serialize?.length > 0) {
      opts?.serialize?.forEach((Opj) => {
         try {
            if(!inputs[Opj?.key]) return
            inputs[Opj?.key] = Opj?.transform(inputs[Opj?.key])
         } catch (error) {
            transformationsErrors.push(Opj?.messageOnInvalid || error.message)
         }
      })
   }
   console.log('inputs', inputs)
   const { error } = schema.validate(inputs, { abortEarly: false })
   try {
      if (error) {
         const errors = [...(error.details.map((detail) => detail.message)), ...transformationsErrors]

         // throw new new Error(errors, { status: 400 })
         throw new ErrorMessage(403, errors)
      }

      return next()
   } catch (err) {
      next(err)
   }
}

// export const validation = (schema) => {
//     return (req, res, next) => {
//         console.log({body:req.body});
//         const validationErr = []
//         dataMethods.forEach(key => {
//             if (schema[key]) {
//                 const validationResult = schema[key].validate(req[key], { abortEarly: false })
//                 if (validationResult.error) {
//                     validationErr.push(validationResult.error.details)
//                 }
//             }
//         });

//         if (validationErr.length) {
//             return res.json({ message: "Validation Err", validationErr })
//         }
//         return next()
//     }
// }
