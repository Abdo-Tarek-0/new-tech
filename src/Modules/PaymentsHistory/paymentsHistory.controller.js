import PaymentHistoryModel from './paymentsHistory.model.js'
import { catchError } from '../../utils/catchAsyncError.js'

export const getMyPaymentsHistory = catchError(async (req, res) => {
   const { user } = req

   const paymentsHistory = await PaymentHistoryModel.find({
      user: user._id,
   }).populate({
      path: 'order',
      select:
         'title status payment originPrice projectDetails totalPrice service image workStatus',
   })

   for (let i = 0; i < paymentsHistory?.length; i += 1) {
      const payment = paymentsHistory[i]
      payment.order.service = undefined
   }

   res.status(200).json({
      status: 'success',
      data: paymentsHistory || [],
   })
})

export const getAllPaymentsHistory = catchError(async (req, res) => {
   const paymentsHistory = await PaymentHistoryModel.find({})
      .populate({
         path: 'user',
         select: 'firstName lastName email -orders',
      })
      .populate({
         path: 'order',
         select:
            'title status payment originPrice projectDetails totalPrice image workStatus',
      })

   for (let i = 0; i < paymentsHistory?.length; i += 1) {
      const payment = paymentsHistory[i]
      payment.order.service = undefined
      payment.user.orders = undefined
   }

   res.status(200).json({
      status: 'success',
      data: paymentsHistory || [],
   })
})
