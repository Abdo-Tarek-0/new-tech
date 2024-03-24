import { Router } from 'express'
import * as controller from './orders.controller.js'
import auth from '../../middleware/auth.js'
import * as validator from './orders.validation.js'
import { validation } from '../../middleware/validation.js'

const router = Router()

router
   .route('/')
   .get(auth('admin'), controller.getAllOrders)
   .post(auth('admin', 'user'), controller.createOrder)

router.get('/me', auth('user', 'admin', 'tech'), controller.getMyOrders)

router.delete(
   '/cancel/:orderId',
   auth('user', 'admin', 'tech'),
   validation(validator.cancelOrderSchema),
   controller.cancelOrder
)

router
   .route('/:orderId')
   .get(
      auth('admin', 'user'),
      validation(validator.getOrderSchema),
      controller.getSingleOrder
   )
   .delete(
      auth('admin'),
      validation(validator.deleteOrderSchema),
      controller.deleteSingleOrder
   )
router
   .route('/:id/status')
   .patch(
      auth('admin'),
      validation(validator.updateOrderStatusSchema),
      controller.updateOrderStatus
   )
   .post(
      auth('admin'),
      validation(validator.addWorkStatusToOrderSchema),
      controller.addWorkStatusToOrder
   )
   .put(
      auth('admin'),
      validation(validator.updateWorkStatusforOrderSchema),
      controller.updateWorkStatusforOrder
   )
   .delete(
      auth('admin'),
      validation(validator.removeOneWorkStatusforOrderSchema),
      controller.removeOneWorkStatusforOrder
   )
export default router
