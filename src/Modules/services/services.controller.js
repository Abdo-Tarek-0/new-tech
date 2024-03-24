import ServicesModel from './services.model.js'
import CategoriesModel from '../categories/categories.model.js'
import { ErrorMessage } from '../../utils/ErrorMessage.js'
import { catchError } from '../../utils/catchAsyncError.js'
import Projects from '../projects/projects.model.js'

export const getAllServices = catchError(async (req, res) => {
   const services = await ServicesModel.find({}).populate('category')
   if (services.length === 0) {
      throw new ErrorMessage(404, 'no services found ')
   }
   res.status(200).json(services)
})

export const getCategoryServices = catchError(async (req, res) => {
   const categoryTask = CategoriesModel.findOne({
      _id: req.params.categoryId,
   })
   const servicesTask = ServicesModel.find({
      category: req.params.categoryId,
   })

   const [category, services] = await Promise.all([categoryTask, servicesTask])
   if (!category) {
      throw new ErrorMessage(404, 'No such category id exists')
   }
   if (services.length === 0) {
      throw new ErrorMessage(404, 'no services found for this category')
   }
   res.status(200).json(services)
})

export const getSingleService = catchError(async (req, res) => {
   const service = await ServicesModel.findOne({
      _id: req.params.serviceId,
   }).populate({
      path: 'oldWork',
      populate: {
         path: 'projectCategory',
      },
   })
   if (!service) {
      throw new ErrorMessage(404, 'no services found for this category')
   }
   res.status(200).json(service)
})
export const addCategoryService = catchError(async (req, res) => {
   Object.keys(req.files).forEach((file) => {
      const [image] = req.files[file]
      req.body[file] = image.dest
   })
   const category = await CategoriesModel.findOne({
      _id: req.body.category,
   })
   if (!category) {
      throw new ErrorMessage(404, 'No such category id exists')
   }
   const newService = await new ServicesModel(req.body).save()
   if (!newService) {
      throw new ErrorMessage(404, 'No categories Added Check Your Data 🙄')
   }
   res.status(201).json(newService)
})

export const editCategoryService = catchError(async (req, res) => {
   if (req.files) {
      Object.keys(req.files).forEach((file) => {
         const [image] = req.files[file]
         req.body[file] = image.dest
      })
   }
   if (req.body.category) {
      const category = await CategoriesModel.findOne({
         _id: req.body.category,
      })
      if (!category) {
         throw new ErrorMessage(404, 'No such category id exists')
      }
   }
   const updatedService = await ServicesModel.updateOne(
      { _id: req.params.serviceId },
      req.body
   )
   if (updatedService.matchedCount === 0) {
      throw new ErrorMessage(404, "service id doesn't exist 🙄")
   }
   res.status(201).json({ message: 'service is updated successfully..!' })
})
export const deleteCategoryService = catchError(async (req, res) => {
   const deletedService = await ServicesModel.deleteOne({
      _id: req.params.serviceId,
   })
   if (deletedService.deletedCount === 0) {
      throw new ErrorMessage(404, "service id doesn't exist 🙄")
   }
   res.status(201).json({ message: 'service is deleted successfully..!' })
})

export const discountForAllServices = catchError(async (req, res) => {
   const services = await ServicesModel.updateMany(
      {},
      {
         $inc: { discount: req.body.discount },
      }
   )
   if (services.length === 0) {
      throw new ErrorMessage(404, 'no services found ')
   }
   res.status(200).json({ message: 'discount For All Services is done..!' })
})
export const discountForSingleCategory = catchError(async (req, res) => {
   const services = await ServicesModel.updateMany(
      { category: req.params.categoryId },
      {
         $inc: { discount: req.body.discount },
      }
   )
   if (services.length === 0) {
      throw new ErrorMessage(404, 'no services found ')
   }
   res.status(200).json({ message: 'discount For Single Category is done..!' })
})

export const addVariationToService = catchError(async (req, res) => {
   if (req.file) {
      req.body.largeImage = req.file.dest
   }
   const dropDownNames = await ServicesModel.findOne(
      {
         _id: req.params.serviceId,
      },
      { dropDownnNames: 1, _id: 0 }
   )
   let isThereDropDown = false

   dropDownNames?.dropDownnNames?.forEach((item) => {
      if (item._id === req.body.dropDownnNameId) {
         isThereDropDown = true
      }
   })

   if (!isThereDropDown) {
      throw new ErrorMessage(404, 'there is no dropdown with this id ')
   }
   const updatedService = await ServicesModel.updateOne(
      { _id: req.params.serviceId },
      { $push: { variations: req.body } }
   )
   if (updatedService.matchedCount === 0) {
      throw new ErrorMessage(404, "service id doesn't exist 🙄")
   }
   res.status(201).json({
      message: 'variation is posted to service successfully..!',
   })
})

export const getServiceVariations = catchError(async (req, res) => {
   const service = await ServicesModel.findOne(
      {
         _id: req.params.serviceId,
      },
      { variations: 1, _id: 0 }
   ).populate({
      path: 'dropDownnNameId',
   })
   if (!service) {
      throw new ErrorMessage(404, 'no services found for this category')
   }
   res.status(200).json(service.variations)
})

export const editServiceVariation = catchError(async (req, res) => {
   if (req.file) {
      req.body.largeImage = req.file.dest
   }
   if (req.body.dropDownnNameId) {
      const dropDownNames = await ServicesModel.findOne(
         {
            _id: req.params.serviceId,
         },
         { dropDownnNames: 1, _id: 0 }
      )
      let isThereDropDown = false

      dropDownNames?.dropDownnNames?.forEach((item) => {
         if (item._id === req.body.dropDownnNameId) {
            isThereDropDown = true
         }
      })

      if (!isThereDropDown) {
         throw new ErrorMessage(404, 'there is no dropdown with this id ')
      }
   }
   const query = {
      _id: req.params.serviceId,
      'variations._id': req.params.variationId,
   }
   const update = { $set: {} }
   // for (const field in req.body) {
   //    update.$set[`variations.$.${field}`] = req.body[field]
   // }
   Object.keys(req.body).forEach((field) => {
      update.$set[`variations.$.${field}`] = req.body[field]
   })

   const updatedService = await ServicesModel.updateOne(query, update)
   if (updatedService.matchedCount === 0) {
      throw new ErrorMessage(404, "Service or variation ID doesn't exist 🙄")
   }
   res.status(201).json({ message: 'variation is updated successfully..!' })
})
export const deleteServiceVariation = catchError(async (req, res) => {
   const { variationId } = req.params
   const query = {
      _id: req.params.serviceId,
      'variations._id': variationId,
   }
   const update = {
      $pull: { variations: { _id: variationId } },
   }
   const updatedService = await ServicesModel.updateOne(query, update)
   if (updatedService.matchedCount === 0) {
      throw new ErrorMessage(404, "Service or variation ID doesn't exist 🙄")
   }

   res.status(201).json({
      message: 'Service variation deleted successfully..!',
   })
})

export const addDetailsItem = catchError(async (req, res) => {
   let update = {}
   if (req.params.position === 'left') {
      update = { $push: { leftDetailsItems: req.body } }
   } else {
      update = { $push: { rightDetailsItems: req.body } }
   }
   const updatedService = await ServicesModel.updateOne(
      { _id: req.params.serviceId },
      update
   )
   if (updatedService.matchedCount === 0) {
      throw new ErrorMessage(404, "service id doesn't exist 🙄")
   }
   res.status(201).json({
      message: `details is posted to ${req.params.position} successfully..!`,
   })
})

export const updateDetailsItem = catchError(async (req, res) => {
   let update = {}
   let query = {}
   if (req.params.position === 'left') {
      query = {
         _id: req.params.serviceId,
         'leftDetailsItems._id': req.params.itemId,
      }
      update = {
         $set: {
            'leftDetailsItems.$.content': req.body.content,
         },
      }
   } else {
      query = {
         _id: req.params.serviceId,
         'rightDetailsItems._id': req.params.itemId,
      }
      update = {
         $set: {
            'rightDetailsItems.$.content': req.body.content,
         },
      }
   }
   const updatedService = await ServicesModel.updateOne(query, update)
   if (updatedService.matchedCount === 0) {
      throw new ErrorMessage(404, "Service or item ID doesn't exist 🙄")
   }
   res.status(201).json({ message: 'details item is updated successfully..!' })
})
export const deleteDetailsItem = catchError(async (req, res) => {
   let update = {}
   let query = {}
   if (req.params.position === 'left') {
      query = {
         _id: req.params.serviceId,
         'leftDetailsItems._id': req.params.itemId,
      }
      update = {
         $pull: { leftDetailsItems: { _id: req.params.itemId } },
      }
   } else {
      query = {
         _id: req.params.serviceId,
         'rightDetailsItems._id': req.params.itemId,
      }
      update = {
         $pull: { rightDetailsItems: { _id: req.params.itemId } },
      }
   }
   const updatedService = await ServicesModel.updateOne(query, update)
   if (updatedService.matchedCount === 0) {
      throw new ErrorMessage(404, "Service or item ID doesn't exist 🙄")
   }
   res.status(201).json({ message: 'details item is updated successfully..!' })
})

export const addProject = catchError(async (req, res) => {
   const project = await Projects.findOne({
      _id: req.body.projectId,
   })
   if (!project) {
      throw new ErrorMessage(404, 'No such project id exists')
   }

   const updatedService = await ServicesModel.updateOne(
      { _id: req.params.serviceId },
      { $addToSet: { oldWork: req.body.projectId } }
   )
   if (updatedService.matchedCount === 0) {
      throw new ErrorMessage(404, "service id doesn't exist 🙄")
   }
   res.status(201).json({
      message: 'project is posted to old work successfully..!',
   })
})

export const deleteProject = catchError(async (req, res) => {
   const updatedService = await ServicesModel.updateOne(
      { _id: req.params.serviceId },
      { $pull: { oldWork: req.body.projectId } }
   )
   if (updatedService.matchedCount === 0) {
      throw new ErrorMessage(404, "service id doesn't exist 🙄")
   }
   res.status(201).json({
      message: 'project is deleted from old work successfully..!',
   })
})

export const addDropDown = catchError(async (req, res) => {
   const updatedService = await ServicesModel.updateOne(
      { _id: req.params.serviceId },
      { $push: { dropDownnNames: req.body } }
   )
   if (updatedService.matchedCount === 0) {
      throw new ErrorMessage(404, "service id doesn't exist 🙄")
   }
   res.status(201).json({
      message: 'dropDownnNames is posted to service successfully..!',
   })
})

export const editDropDown = catchError(async (req, res) => {
   const query = {
      _id: req.params.serviceId,
      'dropDownnNames._id': req.params.dropdId,
   }
   const update = { $set: {} }

   Object.keys(req.body).forEach((field) => {
      update.$set[`dropDownnNames.$.${field}`] = req.body[field]
   })

   const updatedService = await ServicesModel.updateOne(query, update)
   if (updatedService.matchedCount === 0) {
      throw new ErrorMessage(404, "Service or dropDownnNames ID doesn't exist 🙄")
   }
   res.status(201).json({
      message: 'dropDownnNames is updated successfully..!',
   })
})

export const deleteDropDown = catchError(async (req, res) => {
   const dropDownId = req.params.dropdId
   const query = {
      _id: req.params.serviceId,
      'dropDownnNames._id': dropDownId,
   }
   const update = {
      $pull: { dropDownnNames: { _id: dropDownId } },
   }
   const updatedService = await ServicesModel.updateOne(query, update)
   if (updatedService.matchedCount === 0) {
      throw new ErrorMessage(404, "Service or variation ID doesn't exist 🙄")
   }

   res.status(201).json({ message: 'drop Downn Name  deleted successfully..!' })
})

export const getDropDown = catchError(async (req, res) => {
   const service = await ServicesModel.findOne(
      {
         _id: req.params.serviceId,
      },
      { dropDownnNames: 1, _id: 0 }
   )
   if (!service) {
      throw new ErrorMessage(404, 'no services found for this category')
   }
   res.status(200).json(service.dropDownnNames)
})

export const addMixedPrice = catchError(async (req, res) => {
   const variations = await ServicesModel.findOne(
      {
         _id: req.params.serviceId,
      },
      { variations: 1, _id: 0 }
   )
   let isThereDropDown = req.body.variationsId.length

   variations.variations.forEach((variation) => {
      req.body.variationsId.forEach((mixId) => {
         if (mixId === variation._id) {
            isThereDropDown -= 1
         }
      })
   })

   if (isThereDropDown !== 0) {
      throw new ErrorMessage(404, 'there is error in categories ids ')
   }
   const updatedService = await ServicesModel.updateOne(
      { _id: req.params.serviceId },
      { $push: { mixedPrices: req.body } }
   )
   if (updatedService.matchedCount === 0) {
      throw new ErrorMessage(404, "service id doesn't exist 🙄")
   }
   const mixedPrices = await ServicesModel.findOne(
      {
         _id: req.params.serviceId,
      },
      { mixedPrices: 1, _id: 0 }
   )
   res.status(201).json(mixedPrices)
})

export const getMixedPrice = catchError(async (req, res) => {
   const service = await ServicesModel.findOne(
      {
         _id: req.params.serviceId,
      },
      { mixedPrices: 1, _id: 0 }
   )
   if (!service) {
      throw new ErrorMessage(404, 'no services found for this category')
   }
   res.status(200).json(service.mixedPrices)
})

export const editMixedPrice = catchError(async (req, res) => {
   if (req.body.variationsId) {
      const variations = await ServicesModel.findOne(
         {
            _id: req.params.serviceId,
         },
         { variations: 1, _id: 0 }
      )
      let isThereDropDown = req.body.variationsId.length

      variations.variations.forEach((variation) => {
         req.body.variationsId.forEach((mixId) => {
            if (mixId === variation._id) {
               isThereDropDown -= 1
            }
         })
      })
      if (isThereDropDown !== 0) {
         throw new ErrorMessage(404, 'there is error in categories ids ')
      }
   }
   const query = {
      _id: req.params.serviceId,
      'mixedPrices._id': req.params.mxId,
   }
   const update = { $set: {} }

   Object.keys(req.body).forEach((field) => {
      update.$set[`mixedPrices.$.${field}`] = req.body[field]
   })

   const updatedService = await ServicesModel.updateOne(query, update)
   if (updatedService.matchedCount === 0) {
      throw new ErrorMessage(404, "Service or variation ID doesn't exist 🙄")
   }
   res.status(201).json({
      message: 'mixedPrices is updated to service successfully..!',
   })
})
export const deleteMixedPrice = catchError(async (req, res) => {
   const mixedPriceId = req.params.mxId
   const query = {
      _id: req.params.serviceId,
      'mixedPrices._id': mixedPriceId,
   }
   const update = {
      $pull: { mixedPrices: { _id: mixedPriceId } },
   }
   const updatedService = await ServicesModel.updateOne(query, update)
   if (updatedService.matchedCount === 0) {
      throw new ErrorMessage(404, "Service or variation ID doesn't exist 🙄")
   }

   res.status(201).json({ message: 'mixed Price   deleted successfully..!' })
})
