import { Router } from 'express'
import * as controller from './services.controller.js'
import * as validator from './services.validation.js'
import { validation } from '../../middleware/validation.js'
import { fileUpload, fileValidation } from '../../utils/multer.js'
import auth from '../../middleware/auth.js'

const router = Router()
router
   .route('/')
   .get(
      // get all services from all categories
      controller.getAllServices
   )
   .post(
      auth('admin', 'tech'),
      // add new service
      fileUpload('services', fileValidation.image).fields([
         { name: 'defaultLargeImage' },
         { name: 'smallImage' },
      ]),
      validation(validator.addCategoryService),
      controller.addCategoryService
   )
   .patch(
      auth('admin', 'tech'),
      // increase or decrease discount for all services of all categories
      validation(validator.discountForAllServices),
      controller.discountForAllServices
   )
router.route('/:categoryId/allservices').get(
   // get services of single category
   validation(validator.getCategoryServices),
   controller.getCategoryServices
)
router.route('/:categoryId/discount').patch(
   auth('admin', 'tech'),
   // increase or decrease discount for all services of single category
   validation(validator.discountForSingleCategory),
   controller.discountForSingleCategory
)
router
   .route('/:serviceId')
   .get(
      // get single service
      validation(validator.getSingleService),
      controller.getSingleService
   )
   .patch(
      // edit single service
      auth('admin', 'tech'),
      fileUpload('services', fileValidation.image).fields([
         { name: 'defaultLargeImage' },
         { name: 'smallImage' },
      ]),
      validation(validator.editCategoryService),
      controller.editCategoryService
   )
   .delete(
      auth('admin', 'tech'),
      // delete single service
      validation(validator.deleteCategoryService),
      controller.deleteCategoryService
   )
router.route('/:serviceId/variations').get(
   // get all service variations
   validation(validator.getServiceVariations),
   controller.getServiceVariations
)
router
   .route('/:serviceId/variations/select')
   .post(
      auth('admin'),
      validation(validator.addVariationSelect),
      controller.addVariationSelect
   )
router
   .route('/:serviceId/variations/input')
   .post(
      auth('admin'),
      validation(validator.addVariationInput),
      controller.addVariationInput
   )

router.route('/variations/:variationId/select').patch(
   auth('admin'),
   validation(validator.editVariationSelect),
   controller.editVariationSelect
)
router.route('/variations/:variationId/input').patch(
   auth('admin'),
   validation(validator.editVariationInput),
   controller.editVariationInput
)
   
// .post(
//    auth('admin', 'tech'),
//    // to add variation to a service
//    fileUpload('services', fileValidation.image).single('largeImage'),
//    validation(validator.addVariationToService),
//    controller.addVariationToService
// )

router
   .route('/:serviceId/variations/:variationId')
   // .patch(
   //    auth('admin', 'tech'),
   //    // edit variation from a service
   //    fileUpload('services', fileValidation.image).single('largeImage'),
   //    validation(validator.editServiceVariation),
   //    controller.editServiceVariation
   // )
   .delete(
      auth('admin', 'tech'),
      // edit variation from a service
      validation(validator.deleteServiceVariation),
      controller.deleteServiceVariation
   )
router
   .route('/:serviceId/details/:position')
   .post(
      auth('admin', 'tech'),
      validation(validator.addDetailsItem),
      controller.addDetailsItem
   )
router
   .route('/:serviceId/details/:position/:itemId')
   .patch(
      auth('admin', 'tech'),
      validation(validator.updateDetailsItem),
      controller.updateDetailsItem
   )
   .delete(
      auth('admin', 'tech'),
      validation(validator.deleteDetailsItem),
      controller.deleteDetailsItem
   )

router
   .route('/:serviceId/oldWork')
   .post(
      auth('admin', 'tech'),
      validation(validator.addProject),
      controller.addProject
   )
   .patch(
      auth('admin', 'tech'),
      validation(validator.deleteProject),
      controller.deleteProject
   )

router
   .route('/:serviceId/dropDownName')
   .get(validation(validator.getDropDown), controller.getDropDown)
   .post(
      auth('admin', 'tech'),
      validation(validator.addDropDown),
      controller.addDropDown
   )

router
   .route('/:serviceId/dropDownName/:dropdId')
   .patch(
      auth('admin', 'tech'),
      validation(validator.editDropDown),
      controller.editDropDown
   )
   .delete(
      auth('admin', 'tech'),
      validation(validator.deleteDropDown),
      controller.deleteDropDown
   )

router
   .route('/:serviceId/mixedPrice')
   .post(
      auth('admin', 'tech'),
      validation(validator.addMixedPrice),
      controller.addMixedPrice
   )
   .get(validation(validator.getMixedPrice), controller.getMixedPrice)
router
   .route('/:serviceId/mixedPrice/:mxId')
   .patch(
      auth('admin', 'tech'),
      validation(validator.editMixedPrice),
      controller.editMixedPrice
   )
   .delete(
      auth('admin', 'tech'),
      validation(validator.deleteMixedPrice),
      controller.deleteMixedPrice
   )

export default router
