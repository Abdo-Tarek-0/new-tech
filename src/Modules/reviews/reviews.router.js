import { Router } from 'express'
import * as controller from './reviews.controller.js'
import * as validator from './reviews.validation.js'
import { validation } from '../../middleware/validation.js'
import { fileUpload, fileValidation } from '../../utils/multer.js'
import auth from '../../middleware/auth.js'

const router = Router()
router
   .route('/')
   .get(controller.getAllReviews)
   .post(
      auth('admin', 'tech'),
      fileUpload('reviews', fileValidation.image).fields([{ name: 'image' }]),
      validation(validator.addReview),
      controller.addReview
   )
router
   .route('/:reviewId')
   .patch(
      auth('admin', 'tech'),
      fileUpload('reviews', fileValidation.image).fields([{ name: 'image' }]),
      validation(validator.updateReview),
      controller.updateReview
   )
   .delete(
      auth('admin', 'tech'),
      validation(validator.deleteReview),
      controller.deleteReview
   )
export default router
