import Messages from './messages.model.js'
import { ErrorMessage } from '../../utils/ErrorMessage.js'
import { catchError } from '../../utils/catchAsyncError.js'
import Conversations from '../conversations/conversations.model.js'

import extractURLs from '../../utils/extractURLS/extractUrls.js'

export const getConvoMessages = catchError(async (req, res) => {
   // get the necessary data from the req (limit is always 10 change in the future)
   const messageId = req?.query?.messageId ?? null
   const direction = req?.query?.dir === 'next' ? '$gt' : '$lt' // the direction of messages to get
   const limit =
      req?.query?.dir === 'next'
         ? Number(process.env.MASSAGES_LIMIT_PAGINATION_NEXT)
         : Number(process.env.MASSAGES_LIMIT_PAGINATION_PREV)

   // pagination is done by getting the messages before or after the message id you send
   // it is 100% like Upwork
   let messages = Messages.find({
      conversation: req.params.convId, // get the messages of this conversation
      _id: messageId ? { [direction]: messageId } : { $exists: true }, // if there's a message id get the messages after or before it
   })
      .sort({ _id: direction === '$gt' ? 1 : -1 }) // sort the messages by id if the direction is next then ascending else descending
      .populate({
         path: 'sender',
         select: {
            password: 0,
            orders: 0,
            confirmEmail: 0,
            resetCode: 0,
            googleId: 0,
            facebookId: 0,
            ContactInformation: 0,
            changePasswordAt: 0,
            createdAt: 0,
            updatedAt: 0,
            codeRequestMaxNumber: 0,
            email: 0,
            phone: 0,
            __v: 0,
            country: 0,
            gender: 0,
            isSuperAdmin: 0,
            suspended: 0,
            role: 0,
         },
      })
      .populate({
         path: 'attachments',
         select: {
            __v: 0,
            createdAt: 0,
            updatedAt: 0,
            senderId: 0,
         },
      })
      .limit(limit)

   let conversation = Conversations.findOne({
      _id: req.params.convId,
   })

   ;[messages, conversation] = await Promise.all([messages, conversation])

   if (
      req?.user?.role !== 'admin' &&
      req?.user?.role !== 'tech' &&
      conversation?.client?.toString() !== req?.user?._id?.toString()
   )
      throw new ErrorMessage(403, "You're not allowed to see this conversation")

   if (!conversation) throw new ErrorMessage(404, 'No such conversation id exists')

   if (!messages) {
      throw new ErrorMessage(404, "there're no Messages  to show")
   }

   res.status(200).json({
      data: messages,

      length: messages.length,
      direction: req?.query?.dir,
      limit,
   })
})

export const addNewMessage = catchError(async (req, res) => {
   const { conversation: conversationId } = req.body

   let conversation = Conversations.findOne({
      _id: conversationId,
   })
   let localMessageId = Messages.find({
      conversation: conversationId,
   }).countDocuments()

   // promise all to get the conversation and the number, better performance, concurrency
   ;[conversation, localMessageId] = await Promise.all([
      conversation,
      localMessageId,
   ])

   // some cleaning and adding some data to the req body
   req.body.local_id = localMessageId // is a local id for the message from the start of the conversation
   req.body.attachments = req.body.attachments ?? [] // ex: ["65868f380ed2a281029989b7"]
   req.body.sender = req.user._id // get the user id from the token authentication
   req.body.links = extractURLs(req?.body?.content ?? '') // ex: ["https://google.com", "https://facebook.com"]
   req.body.isFromAdmin = !!(
      req?.user?.role === 'admin' || req?.user?.role === 'tech'
   ) // if the sender is admin then isFromAdmin is true else false

   // validations and checks
   if (
      req?.user?.role !== 'admin' &&
      req?.user?.role !== 'tech' &&
      conversation?.client?.toString() !== req?.user?._id?.toString()
   )
      throw new ErrorMessage(
         403,
         "You're not allowed to send messages to this conversation"
      )
   if (!conversation) throw new ErrorMessage(404, 'No such conversation id exists')
   if (!req?.body?.content && !req?.body?.attachments?.length)
      throw new ErrorMessage(400, 'You must send a message or an attachment')

   // create the message
   const newMessage = await new Messages(req.body)
   // await newMessage.save();

   // Promise all is here for making the 3 operations in parallel not waiting for each other, better performance
   // first populate the sender data to the message
   // second populate the attachments data to the message
   // third update the conversation lastMessageOn and lastMessage
   await Promise.all([
      newMessage.save(),
      newMessage.populate({
         path: 'sender',
         select: {
            password: 0,
            orders: 0,
            confirmEmail: 0,
            resetCode: 0,
            googleId: 0,
            facebookId: 0,
            ContactInformation: 0,
            changePasswordAt: 0,
            createdAt: 0,
            updatedAt: 0,
            codeRequestMaxNumber: 0,
            email: 0,
            phone: 0,
            __v: 0,
            country: 0,
            gender: 0,
            isSuperAdmin: 0,
            suspended: 0,
            role: 0,
         },
      }),
      newMessage.populate({
         path: 'attachments',
         select: {
            __v: 0,
            createdAt: 0,
            updatedAt: 0,
            senderId: 0,
         },
      }),
      Conversations.updateOne(
         { _id: conversationId },
         {
            lastMessageOn: Date.now(),
            lastMessage: {
               content: req?.body?.content ?? 'Media 🔉',
               isFromAdmin: req?.body?.isFromAdmin ?? false,
               messageId: newMessage._id,
            },
         }
      ),
   ])

   if (!newMessage) throw new ErrorMessage(404, 'error creating your message')

   res.status(200).json({
      data: newMessage,
   })
})

export const getMediaAndLinks = catchError(async (req, res) => {
   // get the type of the messages to get
   // all: get all messages that have attachments or links
   // media: get all messages that have attachments
   // links: get all messages that have links
   const type = req?.query?.type ?? 'all'
   const conversationId = req.params.convId

   const match = {
      conversation: conversationId,
   }
   const notEmptyArray = { $exists: true, $not: { $size: 0 } }

   if (type === 'all') {
      // if the type is all then get all messages that have attachments or links
      match.$or = [
         {
            attachments: notEmptyArray,
         },
         {
            links: notEmptyArray,
         },
      ]
      console.log(JSON.stringify(match, null, 2))
   } else if (type === 'media') {
      // if the type is media then get all messages that have attachments only
      match.attachments = notEmptyArray
   } else if (type === 'links') {
      // if the type is links then get all messages that have links only
      match.links = notEmptyArray
   }

   // get the messages with sender and attachments populated
   let messages = Messages.find(match)
      .populate({
         path: 'sender',
         select: {
            password: 0,
            orders: 0,
            confirmEmail: 0,
            resetCode: 0,
            googleId: 0,
            facebookId: 0,
            ContactInformation: 0,
            changePasswordAt: 0,
            createdAt: 0,
            updatedAt: 0,
            codeRequestMaxNumber: 0,
            email: 0,
            phone: 0,
            __v: 0,
            country: 0,
            gender: 0,
            isSuperAdmin: 0,
            suspended: 0,
            role: 0,
         },
      })
      .populate({
         path: 'attachments',
         select: {
            __v: 0,
            createdAt: 0,
            updatedAt: 0,
            senderId: 0,
         },
      })
      .sort({ _id: -1 })

   let conversation = Conversations.findOne({
      _id: conversationId,
   })

   ;[messages, conversation] = await Promise.all([messages, conversation])

   if (
      req?.user?.role !== 'admin' &&
      req?.user?.role !== 'tech' &&
      conversation?.client?.toString() !== req?.user?._id?.toString()
   )
      throw new ErrorMessage(403, "You're not allowed to see this conversation")

   if (!conversation) throw new ErrorMessage(404, 'No such conversation id exists')

   res.status(200).json({
      data: messages,
      length: messages.length,
   })
})

export const searchMessages = catchError(async (req, res) => {
   // get the query from the req
   // the query here is the word you want to search for in the messages
   // ex: "hello" will return all messages that have the word hello in them
   const { query } = req.query

   // get the messages that have the query in them
   let messages = Messages.find({
      $text: { $search: query },
      conversation: req.params.convId,
   }).populate({
      path: 'sender',
      select: {
         password: 0,
         orders: 0,
         confirmEmail: 0,
         resetCode: 0,
         googleId: 0,
         facebookId: 0,
         ContactInformation: 0,
         changePasswordAt: 0,
         createdAt: 0,
         updatedAt: 0,
         codeRequestMaxNumber: 0,
         email: 0,
         phone: 0,
         __v: 0,
      },
   })

   let conversation = Conversations.findOne({
      _id: req.params.convId,
   })

   ;[messages, conversation] = await Promise.all([messages, conversation])

   if (
      req?.user?.role !== 'admin' &&
      req?.user?.role !== 'tech' &&
      conversation?.client?.toString() !== req?.user?._id?.toString()
   )
      throw new ErrorMessage(403, "You're not allowed to see this conversation")

   if (!conversation) throw new ErrorMessage(404, 'No such conversation id exists')

   res.status(200).json({
      data: messages,
      length: messages.length,
      keyword: query,
   })
})

export const getSearchedMessage = catchError(async (req, res) => {
   // when you search for a message you get the message id
   // this is where you actually get the message page with the message and the 4 messages before and after it like Upwork
   const messageId = req?.params?.messageId
   const { convId } = req.params
   const limit = Number(process.env.MASSAGES_LIMIT_PAGINATION_SEARCH)

   const limitPrev = Math.floor(limit / 2)
   const limitNext = limit - limitPrev

   // get the 25 messages before
   let prevMessages = Messages.find({
      _id: { $lt: messageId },
      conversation: convId,
   })
      .populate({
         path: 'sender',
         select: {
            password: 0,
            orders: 0,
            confirmEmail: 0,
            resetCode: 0,
            googleId: 0,
            facebookId: 0,
            ContactInformation: 0,
            changePasswordAt: 0,
            createdAt: 0,
            updatedAt: 0,
            codeRequestMaxNumber: 0,
            email: 0,
            phone: 0,
            __v: 0,
         },
      })
      .sort({ _id: -1 })
      .limit(limitPrev)

   // get the 25 messages after the message it self as one of the 25 messages
   let nextMessages = Messages.find({
      _id: { $gte: messageId },
      conversation: convId,
   })
      .populate({
         path: 'sender',
         select: {
            password: 0,
            orders: 0,
            confirmEmail: 0,
            resetCode: 0,
            googleId: 0,
            facebookId: 0,
            ContactInformation: 0,
            changePasswordAt: 0,
            createdAt: 0,
            updatedAt: 0,
            codeRequestMaxNumber: 0,
            email: 0,
            phone: 0,
            __v: 0,
         },
      })
      .sort({ _id: 1 })
      .limit(limitNext)

   let conversation = Conversations.findOne({
      _id: convId,
   })

   // better performance by using Promise.all
   ;[prevMessages, nextMessages, conversation] = await Promise.all([
      prevMessages,
      nextMessages,
      conversation,
   ])

   // get the message it self
   const message = nextMessages
      .concat(prevMessages)
      .find((msg) => msg._id.toString() === messageId.toString())

   // remove the message it self from the next messages
   nextMessages = nextMessages.filter(
      (msg) => msg._id.toString() !== messageId.toString()
   )

   if (
      req?.user?.role !== 'admin' &&
      req?.user?.role !== 'tech' &&
      conversation?.client?.toString() !== req?.user?._id?.toString()
   )
      throw new ErrorMessage(403, "You're not allowed to see this conversation")

   if (!conversation) throw new ErrorMessage(404, 'No such conversation id exists')

   res.status(200).json({
      data: {
         message, // the message it self
         nextMessages, // 24 messages after it
         prevMessages, // 25 messages before it
      },
      limitPrev,
      limitNext,
   })
})
