import { Router } from 'express'
import * as controller from './projectsCategories.controller.js'
import * as validator from './projectsCategories.validation.js'
import { validation } from '../../middleware/validation.js'
import auth from '../../middleware/auth.js'

const router = Router()
router
   .route('/')
   .get(controller.getAllCategories)
   .post(validation(validator.addCategory), controller.addCategory)

router
   .route('/:id')
   .patch(
      auth('admin', 'tech'),
      validation(validator.updateCategory),
      controller.updateCategory
   )
   .delete(
      auth('admin', 'tech'),
      validation(validator.deleteCategory),
      controller.deleteCategory
   )
export default router
