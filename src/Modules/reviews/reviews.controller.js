import Reviews from './reviews.model.js'
import { ErrorMessage } from '../../utils/ErrorMessage.js'
import { catchError } from '../../utils/catchAsyncError.js'

export const getAllReviews = catchError(async (req, res) => {
   const reviews = await Reviews.find()
   if (reviews.length === 0) {
      throw new ErrorMessage(404, 'no reviews found')
   }
   res.status(200).json(reviews)
})

export const addReview = catchError(async (req, res) => {
   Object.keys(req.files).forEach((file) => {
      const [image] = req.files[file]
      req.body[file] = image.dest
   })
   const newReview = await new Reviews(req.body).save()
   if (!newReview) {
      throw new ErrorMessage(404, 'No reviews Added Check Your Data 🙄')
   }
   res.status(201).json(newReview)
})

export const updateReview = catchError(async (req, res) => {
   if (req.files) {
      Object.keys(req.files).forEach((file) => {
         const [image] = req.files[file]
         req.body[file] = image.dest
      })
   }
   const updatedReview = await Reviews.findByIdAndUpdate(
      { _id: req.params.reviewId },
      req.body,
      { new: true }
   )
   if (updatedReview.matchedCount === 0) {
      throw new ErrorMessage(404, "review id doesn't exist 🙄")
   }
   res.status(201).json(updatedReview)
})

export const deleteReview = catchError(async (req, res) => {
   const deletedReview = await Reviews.deleteOne({
      _id: req.params.reviewId,
   })
   if (deletedReview.deletedCount === 0) {
      throw new ErrorMessage(404, "review id doesn't exist 🙄")
   }

   res.status(201).json({ message: 'review is deleted successfully..!' })
})
