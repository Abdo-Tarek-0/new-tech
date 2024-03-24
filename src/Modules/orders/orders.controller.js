import mongoose from 'mongoose'
import OrdersModel from './orders.model.js'
import { ErrorMessage } from '../../utils/ErrorMessage.js'
import { catchError } from '../../utils/catchAsyncError.js'
import { sendGrid } from '../../utils/sendGrid.js'
import ServicesModel from '../services/services.model.js'
import UserModel from '../user/user.model.js'
import Conversations from '../conversations/conversations.model.js'
import Messages from '../messages/messages.model.js'
import { sendOrderCanceledEmailUser } from '../../utils/customEmails.js'

export const createOrder = catchError(async (req, res) => {
   const { service } = req.body

   const { id, email, firstName, lastName } = req.decoded
   req.body.user = id
   const searchedservice = await ServicesModel.findOne({ _id: service })
   if (!searchedservice) {
      throw new ErrorMessage(404, "service doesn't exist")
   }
   req.body.device = req?.device

   const order = await OrdersModel.create(req.body)

   await UserModel.findByIdAndUpdate(
      id,
      { $addToSet: { orders: order._id } },
      { new: true }
   )

   const { chossen } = order
   let variantName = 'default variant'

   if (chossen.length > 0) {
      variantName = chossen
         .flatMap((item) => Object.values(item).map((subItem) => subItem.title))
         .map((obj) =>
            Object.entries(obj)
               .map(
                  ([key, value]) =>
                     // console.log(`${key} ${value}`);
                     `${key} ${value}`
               )
               .join(' ')
         )
         .join(' ')
   }

   const sendEmailTask1 = sendGrid({
      to: email,
      from: process.env.ORDER_SENDER_EMAIL,
      subject: 'order creation ',
      templateId: process.env.ORDER_CREATED_TEMPLATE_ID,
      data: {
         orderID: order._id,
         userName: `${firstName} ${lastName}`,
         serviceName: order.title,
         variationName: variantName,
      },
   })

   const sendEmailTask2 = sendGrid({
      to: process.env.INFO_RECEIVER_EMAIL,
      from: process.env.ORDER_SENDER_EMAIL,
      subject: 'order creation ',
      templateId: process.env.ADMIN_ORDER_CREATED_TEMPLATE_ID,
      data: {
         orderID: order._id,
         userName: `${firstName} ${lastName}`,
         email,
         variationName: variantName,
         serviceName: order.title,
      },
   })

   await Promise.all([sendEmailTask1, sendEmailTask2])

   if (order) {
      delete order._doc.device
      res.status(201).json({ msg: 'order created successfully', order })
   } else {
      throw new ErrorMessage(404, 'order creation failed')
   }
})

export const updateOrderStatus = catchError(async (req, res) => {
   const { id } = req.params
   const { id: userId } = req.decoded

   const order = await OrdersModel.findById(id).populate({
      path: 'user',
      select: { email: 1, firstName: 1, lastName: 1 },
   })

   if (!order) {
      throw new ErrorMessage(404, 'Order not found')
   }
   if (order.isDeleted) {
      throw new ErrorMessage(404, 'Order is deleted')
   }
   if (order.payment === 'unpaid') {
      throw new ErrorMessage(
         401,
         "Order status can't be updated before purchase"
      )
   }
   req.body.updatedBy = userId
   const updatedOrder = await OrdersModel.updateOne(
      { _id: id, isDeleted: false },
      req.body
   )
   if (updatedOrder) {
      const { chossen } = order
      let variantName = 'default variant'

      if (chossen.length > 0) {
         variantName = chossen
            .flatMap((item) =>
               Object.values(item).map((subItem) => subItem.title)
            )
            .map((obj) =>
               Object.entries(obj)
                  .map(
                     ([key, value]) =>
                        // console.log(`${key} ${value}`);
                        `${key} ${value}`
                  )
                  .join(' ')
            )
            .join(' ')
      }
      const sendEmailTask1 = sendGrid({
         to: order.user.email,
         from: process.env.ORDER_SENDER_EMAIL,
         subject: 'order creation ',
         templateId: process.env.ORDER_STATUS_INFO_USER_CHANGED_TEMPLATE_ID,
         data: {
            orderID: order._id,
            userName: `${order.user.firstName} ${order.user.lastName}`,
            status: req.body.status,
            variationName: variantName,
            serviceName: order.title,
         },
      })

      const sendEmailTask2 = sendGrid({
         to: process.env.INFO_RECEIVER_EMAIL,
         from: process.env.ORDER_SENDER_EMAIL,
         subject: 'order creation ',
         templateId: process.env.ORDER_STATUS_INFO_ADMIN_CHANGED_TEMPLATE_ID,
         data: {
            orderID: order._id,
            userName: `admin`,
            status: req.body.status,
            variationName: variantName,
            serviceName: order.title,
            orderUser: `${order.user.firstName} ${order.user.lastName}`,
         },
      })

      await Promise.all([sendEmailTask1, sendEmailTask2])

      res.status(200).json({ msg: 'order  updated successfully', updatedOrder })
   } else {
      throw new ErrorMessage(404, "Order status isn't updated check data ")
   }
})

export const getAllOrders = catchError(async (req, res) => {
   const orders = await OrdersModel.find({}).select('+device')
   if (orders.length === 0) {
      throw new ErrorMessage(404, 'no orders found ')
   }
   res.status(200).json(orders)
})

export const getSingleOrder = catchError(async (req, res) => {
   const { id: userId, role } = req.decoded
   const order = await OrdersModel.findOne({
      _id: new mongoose.Types.ObjectId(req.params.orderId),
      isDeleted: false,
   })
   if (!order) {
      throw new ErrorMessage(404, 'no order found ')
   }
   if (order.user.toString() === userId || role === 'admin') {
      res.status(200).json(order)
   } else {
      throw new ErrorMessage(401, "you're not authorized to get this order ")
   }
})

export const getMyOrders = catchError(async (req, res) => {
   const { _id: userId } = req.decoded
   const orders = await OrdersModel.find({ user: userId, isDeleted: false })
   if (orders.length === 0) {
      throw new ErrorMessage(404, 'no orders found ')
   }
   res.status(200).json(orders)
})
/// using mongoose transaction
export const deleteSingleOrder = catchError(async (req, res, next) => {
   const session = await mongoose.startSession()
   session.startTransaction()

   try {
      const { orderId } = req.params

      // Check if the order exists and meets deletion criteria
      const order = await OrdersModel.findById(orderId).session(session)
      if (!order) {
         throw new ErrorMessage(404, "Order doesn't exist 🙄")
      }
      if (order.status !== 'completed' && order.payment === 'paid') {
         throw new ErrorMessage(
            403,
            "Sorry, you can't delete this order as it's paid and not completed."
         )
      }

      // Check for associated conversations
      const orderCon = await Conversations.findOne({ order: orderId }).session(
         session
      )

      if (!orderCon) {
         // If no associated conversation, directly delete the order
         const deletedOrder = await OrdersModel.deleteOne({
            _id: orderId,
         }).session(session)

         if (deletedOrder.deletedCount === 0) {
            throw new ErrorMessage(404, "Order doesn't exist 🙄")
         }
      } else {
         // If there is an associated conversation, delete messages and conversation
         const deletedMess = await Messages.deleteMany({
            conversation: orderCon._id,
         }).session(session)
         const deletedConvs = await Conversations.deleteOne({
            order: orderId,
         }).session(session)

         console.log(
            'deleted concv ,messs',
            deletedConvs.deletedCount,
            deletedMess.deletedCount
         )
      }

      // Update the user model
      const updatedUser = await UserModel.updateOne(
         { _id: order.user },
         { $pull: { orders: orderId } }
      ).session(session)

      console.log('updated user', updatedUser)

      // Commit the transaction
      await session.commitTransaction()

      return res.status(200).json({ message: 'Order deleted successfully!' })
   } catch (error) {
      // If an error occurs, abort the transaction
      await session.abortTransaction()
      next(error)
   } finally {
      // End the session
      session.endSession()
   }
})

export const cancelOrder = catchError(async (req, res) => {
   const { orderId: orderStringId } = req.params
   const { user } = req
   const orderId = new mongoose.Types.ObjectId(orderStringId)
   const userId = new mongoose.Types.ObjectId(user._id)

   const order = await OrdersModel.findById(orderId)

   if (!order) throw new ErrorMessage(404, 'Order not found')

   if (order.user.toString() !== userId.toString())
      throw new ErrorMessage(403, 'You are not authorized to cancel this order')

   if (order.isDeleted) throw new ErrorMessage(403, 'Order already cancelled')

   if (order.status === 'completed')
      throw new ErrorMessage(403, "You can't cancel a completed order")

   if (order.payment === 'paid' || order.payment === 'refunded')
      throw new ErrorMessage(403, "You can't cancel a paid or refunded order")

   const deleteConversationTask = Conversations.deleteOne({ order: orderId })
   const deleteMessagesTask = Messages.deleteMany({ order: orderId })

   const updateOrdersTask = OrdersModel.updateOne(
      { _id: orderId },
      { isDeleted: true }
   )
   const updateUserOrdersTask = UserModel.updateOne(
      { _id: userId },
      { $pull: { orders: orderId } }
   )

   const sendEmailTask = sendOrderCanceledEmailUser({
      to: user.email,
      order,
   })

   await Promise.all([
      deleteConversationTask,
      deleteMessagesTask,
      updateOrdersTask,
      updateUserOrdersTask,
      sendEmailTask,
   ])

   res.status(200).json({ message: 'Order cancelled successfully' })
})
/// this code without using mongoose transaction
// export const deleteSingleOrder = catchError(async (req, res) => {
//   const { orderId } = req.params;
//   const order = OrdersModel.findById(orderId);
//   if (!order) {
//     throw new ErrorMessage(404, "order doesn't exist 🙄");
//   }
//   if (order.status !== "completed" && order.payment == "paid") {
//     throw new ErrorMessage(404, " sorry you cant't delete this order  🙄");
//   }

//   const orderCon = await Conversations.findOne({ order: orderId });
//   if (!orderCon) {
//     const deletedOrder = await OrdersModel.deleteOne({
//       _id: orderId,
//     });

//     if (deletedOrder.deletedCount == 0) {
//       throw new ErrorMessage(404, "order doesn't exist 🙄");
//     }

//     await UserModel.updateOne(
//       { _id: order.user },
//       { $pull: { orders: orderId } }
//     );
//     return res
//       .status(204)
//       .json({ message: "order is deleted successfully..!" });
//   } else {
//     const deletedMessages = await Messages.deleteMany({
//       conversation: orderCon._id,
//     });

//     const deletedConv = await Conversations.deleteOne({ order: orderId });
//     if (deletedConv.deletedCount !== 0 && deletedMessages.deletedCount !== 0) {
//       const deletedOrder = await OrdersModel.deleteOne({
//         _id: orderId,
//       });

//       if (deletedOrder.deletedCount == 0) {
//         throw new ErrorMessage(404, "order doesn't exist 🙄");
//       }

//       await UserModel.updateOne(
//         { _id: order.user },
//         { $pull: { orders: orderId } }
//       );

//       res
//         .status(204)
//         .json({ message: "order is deleted successfully..!" });
//     }
//   }
// });

export const addWorkStatusToOrder = catchError(async (req, res) => {
   const { id: userId } = req.decoded
   const workStatus = req.body

   const order = await OrdersModel.findByIdAndUpdate(
      {
         _id: req.params.id,
      },
      {
         $addToSet: {
            workStatus: workStatus.workStatus,
         },
         updatedBy: userId,
      },
      { new: true }
   )
   if (!order) {
      throw new ErrorMessage(404, 'no order found ')
   }
   res.status(200).json({ msg: 'success', order })
})

export const updateWorkStatusforOrder = catchError(async (req, res) => {
   const { id: userId } = req.decoded
   const { _id, title, description, completed } = req.body

   const order = await OrdersModel.updateOne(
      {
         _id: req.params.id,
         'workStatus._id': _id,
         isDeleted: false,
      },
      {
         $set: {
            'workStatus.$.description': description,
            'workStatus.$.completed': completed,
            'workStatus.$.title': title,
            updatedBy: userId,
         },
      }
   )

   if (order.matchedCount === 0) {
      throw new ErrorMessage(404, 'no order found ')
   }
   res.status(200).json({ msg: 'success', order })
})

export const removeOneWorkStatusforOrder = catchError(async (req, res) => {
   const { id: userId } = req.decoded
   const { _id } = req.body

   const order = await OrdersModel.updateOne(
      {
         _id: req.params.id,
         'workStatus._id': _id,
         isDeleted: false,
      },
      {
         $pull: {
            workStatus: { _id },
         },
         $set: { updatedBy: userId },
      }
   )

   if (order.matchedCount === 0) {
      throw new ErrorMessage(404, 'no order found ')
   }
   res.status(200).json({ msg: 'success', order })
})

/**
 * 
 * model.update(
    { _id: 1, "items.id": "2" },
    {
        $set: {
            "items.$.name": "yourValue",
            "items.$.value": "yourvalue",
         }
    }
)
 */
