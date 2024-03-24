import Conversations from './conversations.model.js'
import { ErrorMessage } from '../../utils/ErrorMessage.js'
import { catchError } from '../../utils/catchAsyncError.js'
import ApiFeature from '../../utils/ApiFeature.js'
import Messages from '../messages/messages.model.js'
import OrdersModel from '../orders/orders.model.js'

export const getAll = catchError(async (req, res, next) => {
   const apiFeature = new ApiFeature(
      Conversations.find({ client: req.params.userId })
         .sort({
            lastMessageOn: -1,
         })
         // .populate({
         //   path: "client",
         //   select: { password: 0 },
         // })
         .populate({
            path: 'order',
         }),
      req.query
   )
   apiFeature.mongooseQuery
      .then((docs) => {
         if (!docs) {
            res.status(200).json({ data: [], page: apiFeature.page })
         }
         res.status(200).json({ data: docs, page: apiFeature.page })
      })
      .catch((err) => next(err))
})

export const adminGetAll = catchError(async (req, res, next) => {
   const apiFeature = new ApiFeature(
      Conversations.find()
         .sort({
            lastMessageOn: -1,
         })
         .populate({
            path: 'order',
         })
         .populate({
            path: 'client',
         }),
      req.query
   )
   apiFeature.mongooseQuery
      .then((docs) => {
         if (!docs) {
            res.status(200).json({ data: [], page: apiFeature.page })
         }
         res.status(200).json({ data: docs, page: apiFeature.page })
      })
      .catch((err) => next(err))
})

export const openConversation = catchError(async (req, res, next) => {
   Conversations.findOne({
      client: req.params.userId,
      order: req.body.order,
   })
      .populate({
         path: 'order',
      })
      .then(async (conversationDoc) => {
         if (!conversationDoc) {
            const order = await OrdersModel.findOne({
               _id: req.body.order,
               user: req.params.userId,
            })
            if (!order) {
               throw new ErrorMessage(404, 'No such order id exists')
            }
            new Conversations({
               ...req.body,
               lastMessageOn: Date.now(),
               client: req.params.userId,
            })
               .save()
               .then((conversationDoc2) => {
                  if (!conversationDoc2) {
                     throw new ErrorMessage(
                        404,
                        "can't add this conversation check your data"
                     )
                  }
                  // console.log("conversation created");
                  // res.status(200).json(conversationDoc2);
                  return (
                     Conversations.findById(conversationDoc2._id)
                        // .populate({
                        //   path: "client",
                        //   select: { password: 0 },
                        // })
                        .populate({
                           path: 'order',
                        })
                  )
               })
               .then((docs) => {
                  if (!docs) {
                     throw new ErrorMessage(
                        404,
                        "there're no conversation  to show"
                     )
                  }

                  res.status(200).json(docs)
               })
               .catch((err) => {
                  next(err)
               })
         } else {
            res.status(200).json(conversationDoc)
         }
      })
      .catch((err) => {
         next(err)
      })
})
export const makeConvoMessagesSeen = catchError(async (req, res, next) => {
   Messages.updateMany(
      {
         conversation: req.body.convId,
         sender: { $ne: req.params.userId },
         seen: false,
      },
      { $set: { seen: true } }
   )
      .then(() => {
         res.status(201).json({ message: 'messages updated successfully' })
      })
      .catch((err) => {
         next(err)
      })
})
export const adminMakeConvoMessagesSeen = catchError(async (req, res, next) => {
   Messages.updateMany(
      {
         conversation: req.body.convId,
         isFromAdmin: false,
         seen: false,
      },
      { $set: { seen: true } }
   )
      .then(() => {
         res.status(201).json({ message: 'messages updated successfully' })
      })
      .catch((err) => {
         next(err)
      })
})
export const getUnseenConversations = catchError(async (req, res) => {
   const conversations = await Conversations.find(
      { client: req.params.userId },
      { _id: 1 }
   )
   if (conversations.length === 0) {
      res.status(201).json({ unseenConversations: [] })
   }

   const unseenConversations = await Promise.all(
      conversations.map(async (conversation) => {
         const unseenMessages = await Messages.find({
            conversation: conversation._id,
            sender: { $ne: req.params.userId },
            seen: false,
         })
         if (unseenMessages.length !== 0) {
            return conversation._id
         }
         return null
      })
   )

   // Filter out null values (conversations without unseen messages)
   const filteredUnseenConversations = unseenConversations.filter(
      (conversationId) => conversationId !== null
   )

   res.status(201).json({
      unseenConversations: filteredUnseenConversations,
   })
})
export const adminGetUnseenConversations = catchError(async (req, res) => {
   console.log('here')
   const conversations = await Conversations.find({}, { _id: 1 })
   if (conversations.length === 0) {
      throw new ErrorMessage(404, 'No conversations found')
   }

   const unseenConversations = await Promise.all(
      conversations.map(async (conversation) => {
         const unseenMessages = await Messages.find({
            conversation: conversation._id,
            sender: { $ne: req.params.userId },
            seen: false,
         })
         if (unseenMessages.length !== 0) {
            return conversation._id
         }
         return null
      })
   )

   // Filter out null values (conversations without unseen messages)
   const filteredUnseenConversations = unseenConversations.filter(
      (conversationId) => conversationId !== null
   )

   res.status(201).json({
      unseenConversations: filteredUnseenConversations,
   })
})
export const addNote = catchError(async (req, res) => {
   await Conversations.updateOne(
      { _id: req.params.convId },
      { userNotes: req.body.content }
   )
   res.status(201).json({ message: 'note is posted successfully..!' })
})
export const addminAddNote = catchError(async (req, res) => {
   await Conversations.updateOne(
      { _id: req.params.convId },
      { adminNotes: req.body.content }
   )
   res.status(201).json({ message: 'note is posted successfully..!' })
})
