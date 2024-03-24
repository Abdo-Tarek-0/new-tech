import ProjectsCategories from './projectsCategories.model.js'
import { ErrorMessage } from '../../utils/ErrorMessage.js'
import { catchError } from '../../utils/catchAsyncError.js'

export const getAllCategories = catchError(async (req, res) => {
   const categories = await ProjectsCategories.find()
   if (categories.length === 0) {
      throw new ErrorMessage(404, 'no categories found')
   }
   res.status(200).json(categories)
})

export const addCategory = catchError(async (req, res) => {
   const newCategory = await new ProjectsCategories(req.body).save()
   if (!newCategory) {
      throw new ErrorMessage(404, 'No categories Added Check Your Data 🙄')
   }
   res.status(201).json(newCategory)
})

export const updateCategory = catchError(async (req, res) => {
   const updatedCategory = await ProjectsCategories.updateOne(
      { _id: req.params.id },
      req.body
   )
   if (updatedCategory.matchedCount === 0) {
      throw new ErrorMessage(404, "category id doesn't exist 🙄")
   }
   res.status(201).json({ message: 'category is updated successfully..!' })
})

export const deleteCategory = catchError(async (req, res) => {
   const deletedCategory = await ProjectsCategories.deleteOne({
      _id: req.params.id,
   })
   if (deletedCategory.deletedCount === 0) {
      throw new ErrorMessage(404, "category id doesn't exist 🙄")
   }
   // const deletedServices = await ServicesModel.deleteMany({
   //   category: req.params.id,
   // });
   // if (deletedServices.deletedCount == 0) {
   //   throw new ErrorMessage(404, "this category doesnt have any services");
   // }
   res.status(201).json({ message: 'category is deleted successfully..!' })
})
