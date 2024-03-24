import { Router } from 'express'
import * as controller from './paymentsHistory.controller.js'
import auth from '../../middleware/auth.js'

const router = Router()

router.get('/', auth('admin'), controller.getAllPaymentsHistory)
router.get(
   '/me',
   auth('user', 'admin', 'tech'),
   controller.getMyPaymentsHistory
)

export default router
