import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const getCategoryServices = joi
   .object({
      categoryId: generalFields.id.required(),
   })
   .required()
export const addCategoryService = joi
   .object({
      defaultName: joi.string().min(2).required(),
      defaultTopDescription: joi.string().min(5).max(400).required(),
      defaultLargeImage: generalFields.file.required(),
      defaultPrice: joi.number().required().min(0),
      // dropDownnName: joi.string().required(),
      botDescription: joi.string().min(5).max(800).required(),
      category: generalFields.id.required(),
      // file: joi.object({
      //   smallImage: joi.array().length(1).items(generalFields.file).required(),
      //   largeImage: joi.array().length(1).items(generalFields.file).required(),
      // }),
      smallImage: generalFields.file.required(),
      miniDescription: joi.string().min(5).max(400).required(),
      discount: joi.number().min(0).max(100).required(),
      leftDetailsTitle: joi.string().required(),
      rightDetailsTitle: joi.string().required(),
   })
   .required()

export const editCategoryService = joi
   .object({
      serviceId: generalFields.id.optional(),
      defaultName: joi.string().min(2),
      defaultTopDescription: joi.string().min(5).max(800),
      defaultLargeImage: generalFields.file.optional(),
      defaultPrice: joi.number().min(0),
      // dropDownnName: joi.string(),
      botDescription: joi.string().min(5).max(800),
      category: generalFields.id,
      miniDescription: joi.string().min(5).max(400),

      smallImage: generalFields.file.optional(),
      leftDetailsTitle: joi.string(),
      rightDetailsTitle: joi.string(),
      discount: joi.number().min(0).max(100).optional(),
   })
   .optional()
export const deleteCategoryService = joi
   .object({
      serviceId: generalFields.id.optional(),
   })
   .optional()
export const getSingleService = joi
   .object({
      serviceId: generalFields.id.required(),
   })
   .required()
export const getServiceVariations = joi
   .object({
      serviceId: generalFields.id.required(),
   })
   .required()
export const discountForAllServices = joi
   .object({
      discount: joi.number().required().min(-100).max(100).required(),
   })
   .required()

export const discountForSingleCategory = joi
   .object({
      categoryId: generalFields.id.required(),
      discount: joi.number().required().min(-100).max(100).required(),
   })
   .required()
export const addVariationSelect = joi
   .object({
      serviceId: generalFields.id.required(),
      name: joi.string().min(2).required(),
      isMulti: joi.boolean().required(),
      isOptional: joi.boolean().required(),
      values: joi.array().items(
         joi.object({
            name: joi.string().min(2).required(),
            price: joi.number().min(0).required(),
         })
      ),
   })
   .required()

export const addVariationInput = joi
   .object({
      serviceId: generalFields.id.required(),
      name: joi.string().min(2).required(),
      isOptional: joi.boolean().required(),
      minValue: joi.number().required(),
      maxValue: joi.number().required().min(joi.ref('minValue')),
      step: joi.number().required().max(joi.ref('maxValue')),
      priceBerStep: joi.number().required(),
   })
   .required()

export const editVariationSelect = joi
   .object({
      variationId: generalFields.id.required(),
      name: joi.string().min(2),
      isMulti: joi.boolean(),
      isOptional: joi.boolean(),
      values: joi.array().items(
         joi.object({
            name: joi.string().min(2),
            price: joi.number().min(0),
         })
      ),
   })

// export const addVariationToService = joi
//    .object({
//       serviceId: generalFields.id.required(),
//       name: joi.string().min(2),
//       title: joi.string().min(2).required(),
//       topDescription: joi.string().min(5).max(800),
//       file: generalFields.file,
//       price: joi.number().min(0),
//       dropDownnNameId: generalFields.id.required(),
//    })
//    .required()

export const editServiceVariation = joi
   .object({
      serviceId: generalFields.id.required(),
      variationId: generalFields.id.required(),
      name: joi.string().min(2),
      title: joi.string().min(2),
      topDescription: joi.string().min(5).max(800),
      file: generalFields.file,
      price: joi.number().min(0),
      dropDownnNameId: generalFields.id,
   })
   .required()

export const deleteServiceVariation = joi
   .object({
      serviceId: generalFields.id.required(),
      variationId: generalFields.id.required(),
   })
   .required()
export const addDetailsItem = joi
   .object({
      serviceId: generalFields.id.required(),
      position: joi.string().valid('left', 'right').required(),
      content: joi.string(),
   })
   .required()

export const updateDetailsItem = joi
   .object({
      serviceId: generalFields.id.required(),
      itemId: generalFields.id.required(),
      position: joi.string().valid('left', 'right').required(),
      content: joi.string(),
   })
   .required()
export const deleteDetailsItem = joi
   .object({
      serviceId: generalFields.id.required(),
      itemId: generalFields.id.required(),
      position: joi.string().valid('left', 'right').required(),
   })
   .required()

export const addProject = joi
   .object({
      serviceId: generalFields.id.required(),
      projectId: generalFields.id.required(),
   })
   .required()
export const deleteProject = joi
   .object({
      serviceId: generalFields.id.required(),
      projectId: generalFields.id.required(),
   })
   .required()
export const addDropDown = joi
   .object({
      serviceId: generalFields.id.required(),
      title: joi.string().required(),
   })
   .required()
export const editDropDown = joi
   .object({
      dropdId: generalFields.id.required(),
      serviceId: generalFields.id.required(),
      title: joi.string().required(),
   })
   .required()
export const getDropDown = joi
   .object({
      serviceId: generalFields.id.required(),
   })
   .required()
export const deleteDropDown = joi
   .object({
      dropdId: generalFields.id.required(),
      serviceId: generalFields.id.required(),
   })
   .required()

export const addMixedPrice = joi
   .object({
      serviceId: generalFields.id.required(),
      price: joi.number().required().min(0).required(),
      variationsId: joi.array().items(generalFields.id).required(),
   })
   .required()
export const editMixedPrice = joi
   .object({
      serviceId: generalFields.id.required(),
      price: joi.number().required().min(0),
      variationsId: joi.array().items(generalFields.id),
      mxId: generalFields.id.required(),
   })
   .required()

export const getMixedPrice = joi
   .object({
      serviceId: generalFields.id.required(),
   })
   .required()
export const deleteMixedPrice = joi
   .object({
      mxId: generalFields.id.required(),
      serviceId: generalFields.id.required(),
   })
   .required()
