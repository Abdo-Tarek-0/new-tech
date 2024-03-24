import { Router } from 'express'
import * as controller from './home.controller.js'
import * as validator from './home.validation.js'
import { validation } from '../../middleware/validation.js'
import { fileUpload, fileValidation } from '../../utils/multer.js'
import auth from '../../middleware/auth.js'

const router = Router()
router
   .route('/')
   .get(controller.getHome)
   .patch(
      auth('admin', 'tech'),
      validation(validator.updateHome),
      controller.updateHome
   )
router
   .route('/ourServices/:serviceId')
   .post(
      auth('admin', 'tech'),
      validation(validator.addService),
      controller.addService
   )
   .delete(
      auth('admin', 'tech'),
      validation(validator.deleteService),
      controller.deleteService
   )
router
   .route('/latestProjects/:projectId')
   .post(
      auth('admin', 'tech'),
      validation(validator.addProject),
      controller.addProject
   )
   .delete(
      auth('admin', 'tech'),
      validation(validator.deleteProject),
      controller.deleteProject
   )

router
   .route('/ourClients')
   .post(
      auth('admin', 'tech'),
      fileUpload('home', fileValidation.image).fields([
         { name: 'clientImage' },
      ]),
      validation(validator.addClient),
      controller.addClient
   )
   .delete(
      auth('admin', 'tech'),
      validation(validator.deleteClient),
      controller.deleteClient
   )

router
   .route('/header')
   .patch(
      auth('admin', 'tech'),
      fileUpload('home', fileValidation.image).fields([{ name: 'image' }]),
      validation(validator.updateHeader),
      controller.updateHeader
   )
router
   .route('/aboutUs')
   .patch(
      auth('admin', 'tech'),
      fileUpload('home', fileValidation.image).fields([{ name: 'image' }]),
      validation(validator.updateAboutUs),
      controller.updateAboutUs
   )
router
   .route('/contact')
   .patch(
      auth('admin', 'tech'),
      validation(validator.updateContact),
      controller.updateContact
   )
router
   .route('/whyChooseUs')
   .patch(
      auth('admin', 'tech'),
      fileUpload('home', fileValidation.image).fields([
         { name: 'firstImage' },
         { name: 'secondImage' },
         { name: 'thirdImage' },
         { name: 'fourthImage' },
         { name: 'whyChooseUsImage' },
      ]),
      controller.updateWhyChooseUs
   )

router.route('/FAQs').get(controller.getFAQs).post(
   auth('admin', 'tech'),
   validation(validator.addFAQ),
   controller.addFAQ
)

router.route('/FAQs/:id').patch(
   auth('admin', 'tech'),
   validation(validator.updateFAQ),
   controller.updateFAQ
).delete(
   auth('admin', 'tech'),
   validation(validator.deleteFAQ),
   controller.deleteFAQ
)

export default router
