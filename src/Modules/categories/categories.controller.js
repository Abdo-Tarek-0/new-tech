import CategoriesModel from './categories.model.js'
import { ErrorMessage } from '../../utils/ErrorMessage.js'
import { catchError } from '../../utils/catchAsyncError.js'
import ServicesModel from '../services/services.model.js'

export const getAllCategories = catchError(async (req, res) => {
   const categories = await CategoriesModel.find()
   if (categories.length === 0) {
      throw new ErrorMessage(404, 'no categories found')
   }
   res.status(200).json(categories)
})

export const addCategory = catchError(async (req, res) => {
   if (req.files) {
      Object.keys(req.files).forEach((file) => {
         const [image] = req.files[file]
         req.body[file] = image.dest
      })
   }
   const newCategory = await new CategoriesModel(req.body).save()
   if (!newCategory) {
      throw new ErrorMessage(404, ' Category is not Added 🙄')
   }
   res.status(201).json(newCategory)
})

export const updateCategory = catchError(async (req, res) => {
   if (req.files) {
      Object.keys(req.files).forEach((file) => {
         const [image] = req.files[file]
         req.body[file] = image.dest
      })
   }
   const updatedCategory = await CategoriesModel.findByIdAndUpdate(
      req.params.id,
      req.body
   )
   if (updatedCategory.matchedCount === 0) {
      throw new ErrorMessage(404, "category id doesn't exist 🙄")
   }
   res.status(201).json({ message: 'category is updated successfully..!' })
})

export const deleteCategory = catchError(async (req, res) => {
   const deletedCategory = await CategoriesModel.deleteOne({
      _id: req.params.id,
   })
   if (deletedCategory.deletedCount === 0) {
      throw new ErrorMessage(404, "category id doesn't exist 🙄")
   }
   await ServicesModel.deleteMany({
      category: req.params.id,
   })
   // if (deletedServices.deletedCount == 0) {
   //   throw new ErrorMessage(404, "this category doesnt have any services");
   // }
   res.status(201).json({ message: 'category is deleted successfully..!' })
})
