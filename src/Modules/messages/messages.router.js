import { Router } from 'express'
import * as controller from './messages.controller.js'
import * as validator from './messages.validation.js'
import { validation } from '../../middleware/validation.js'
import auth from '../../middleware/auth.js'

const router = Router()

// Search Messages
router
   .route('/search/:convId')
   .get(
      auth('user'),
      validation(validator.searchMessages),
      controller.searchMessages
   )
router
   .route('/dashboard/chat/search/:convId')
   .get(
      auth('admin', 'tech'),
      validation(validator.searchMessages),
      controller.searchMessages
   )
router
   .route('/getSearchedMessage/:messageId/:convId')
   .get(
      auth('user'),
      validation(validator.getSearchedMessage),
      controller.getSearchedMessage
   )
router
   .route('/dashboard/getSearchedMessage/:messageId/:convId')
   .get(
      auth('admin', 'tech'),
      validation(validator.getSearchedMessage),
      controller.getSearchedMessage
   )

// Get All Messages
router.route('/:convId').get(
   auth('user'),
   // checkSameUser(),
   validation(validator.getConvoMessages),
   controller.getConvoMessages
)
router
   .route('/dashboard/chat/:convId')
   .get(
      auth('admin', 'tech'),
      validation(validator.getConvoMessages),
      controller.getConvoMessages
   )

// Add New Message
router
   .route('/')
   .post(
      auth('user'),
      validation(validator.addNewMessage),
      controller.addNewMessage
   )
router
   .route('/dashboard')
   .post(
      auth('admin', 'tech'),
      validation(validator.addNewMessage),
      controller.addNewMessage
   )

// get media and links
router
   .route('/getMediaAndLinks/:convId')
   .get(
      auth('user'),
      validation(validator.getMediaAndLinks),
      controller.getMediaAndLinks
   )
router
   .route('/dashboard/getMediaAndLinks/:convId')
   .get(
      auth('admin', 'tech'),
      validation(validator.getMediaAndLinks),
      controller.getMediaAndLinks
   )

export default router
