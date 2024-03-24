import { Router } from 'express'
import * as controller from './conversations.controller.js'
import * as validator from './conversations.validation.js'
import { validation } from '../../middleware/validation.js'
import auth, { checkSameUser } from '../../middleware/auth.js'

const router = Router()

router
   .route('/:userId')
   .get(
      auth('user'),
      checkSameUser(),
      validation(validator.getAll),
      controller.getAll
   )
   .post(
      auth('user'),
      checkSameUser(),
      validation(validator.openConversation),
      controller.openConversation
   )
   .patch(
      auth('user'),
      checkSameUser(),
      validation(validator.makeConvoMessagesSeen),
      controller.makeConvoMessagesSeen
   )
router
   .route('/admin/dashboard')
   .get(auth('admin', 'tech'), controller.adminGetAll)
   .patch(
      auth('admin', 'tech'),
      validation(validator.adminMakeConvoMessagesSeen),
      controller.adminMakeConvoMessagesSeen
   )
router
   .route('/:userId/unseenConversations')
   .get(
      auth('user'),
      checkSameUser(),
      validation(validator.getUnseenConversations),
      controller.getUnseenConversations
   )
router
   .route('/admin/dashboard/unseenConversations')
   .get(auth('admin', 'tech'), controller.adminGetUnseenConversations)
router
   .route('/:userId/notes/:convId')
   .post(
      auth('user'),
      checkSameUser(),
      validation(validator.addNote),
      controller.addNote
   )
router
   .route('/dashboard/:convId/notes')
   .post(
      auth('admin', 'tech'),
      validation(validator.addNote),
      controller.addminAddNote
   )
export default router
