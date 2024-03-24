import { ErrorMessage } from './ErrorMessage.js'
import { catchError } from './catchAsyncError.js'

const deleteOne = (model) =>
   catchError(async (request, response, next) => {
      const { id } = request.params
      const result = await model.findByIdAndDelete(id)
      if (!result) {
         return next(new ErrorMessage(404, `Document Not Found 😥`))
      }
      response.status(200).json({
         message: 'Delete Successfully 🤝',
      })
   })

const deleteMany = (model) =>
   catchError(async (request, response, next) => {
      const { ids } = request.body
      const deleted = []

      const promises = ids.map(async (id) => {
         const result = await model.findByIdAndDelete(id)
         if (result) {
            deleted.push(result)
         }
      })

      await Promise.all(promises)
      if (deleted.length === 0) {
         throw new ErrorMessage(404, 'no users found for deleting')
      }
      response.status(200).json({ deleted, message: 'Delete Successfully 🤝' })
   })

export { deleteOne, deleteMany }
