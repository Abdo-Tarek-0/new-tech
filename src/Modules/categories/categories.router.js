import { Router } from 'express'
import * as controller from './categories.controller.js'
import * as validator from './categories.validation.js'
import { validation } from '../../middleware/validation.js'
import { fileUpload, fileValidation } from '../../utils/multer.js'
import auth from '../../middleware/auth.js'
import cache from './categories.cache.manger.js'

const router = Router()
router
   .route('/')
   .get(cache.cacheMiddleware, controller.getAllCategories)
   .post(
      auth('admin', 'tech'),
      fileUpload('categories', fileValidation.image).fields([
         { name: 'image' },
         { name: 'icon' },
      ]),
      validation(validator.addCategory),
      cache.flushMiddleware,
      controller.addCategory
   )
router
   .route('/:id')
   .patch(
      auth('admin', 'tech'),
      fileUpload('categories', fileValidation.image).fields([
         { name: 'image' },
         { name: 'icon' },
      ]),
      validation(validator.updateCategory),
      cache.flushMiddleware,
      controller.updateCategory
   )
   .delete(
      auth('admin', 'tech'),
      validation(validator.deleteCategory),
      cache.flushMiddleware,
      controller.deleteCategory
   )
export default router
