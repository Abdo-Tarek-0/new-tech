import { Router } from 'express'
import * as controller from './attachments.controller.js'
import * as validator from './attachments.validation.js'
import { validation } from '../../middleware/validation.js'
import { fileUpload, fileValidation } from '../../utils/multer.js'
import auth from '../../middleware/auth.js'

const router = Router()

//POST /attachments/
router.post(
   '/',
   auth('user', 'admin', 'tech'),
   fileUpload('attachments', fileValidation.messages, {
      isHash: true,
   }).fields([{ name: 'file', maxCount: 1 }]),
   validation(validator.storeAttachment),
   controller.storeAttachment
)

//DELETE /attachments/dead
router.delete('/dead', auth('admin'), controller.deleteDeadAttachments)

//DELETE /attachments/:id
router.delete(
   '/:id',
   auth('user', 'admin', 'tech'),
   validation(validator.deleteAttachment),
   controller.deleteAttachment
)

export default router
