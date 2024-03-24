import Attachment from './attachments.model.js'
import { ErrorMessage } from '../../utils/ErrorMessage.js'
import { catchError } from '../../utils/catchAsyncError.js'
import { deleteUploadedFile } from '../../utils/files.utils.js'

import Messages from '../messages/messages.model.js'

export const storeAttachment = catchError(async (req, res) => {
   // store attachment from the field name "file" i only accept one file
   const file = req?.files?.file?.[0]

   if (!file) throw new ErrorMessage(400, 'No file found')

   const attachment = await Attachment.create({
      senderId: req.decoded.id,
      encoding: file.encoding,
      mimetype: file.mimetype,
      destination: file.dest,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
   })

   res.status(201).json({
      data: attachment,
   })
})

export const deleteAttachment = catchError(async (req, res) => {
   const { id } = req.params

   const attach = await Attachment.findOne({
      _id: id,
      senderId: req.user._id,
   })

   if (!attach) throw new ErrorMessage(404, 'Attachment not found')

   // delete the file from the server
   await deleteUploadedFile(attach.destination)
   // delete the attachment from the database
   await attach.deleteOne()

   res.status(204).json()
})

export const deleteDeadAttachments = catchError(async (req, res) => {
   // get all messages that have attachments
   const messages = await Messages.find({
      attachments: { $exists: true, $ne: [] },
   })

   // get all attachments that are not in any message
   const deadAttachments = await Attachment.find({
      _id: {
         $nin: messages.map((message) => message.attachments).flat(),
      },
   })

   // delete all dead attachments , promise.all to delete all at once, better performance
   await Promise.allSettled(
      deadAttachments.map(async (attachment) => {
         // delete the file from the server
         await deleteUploadedFile(attachment.destination)
         // delete the attachment from the database
         await attachment.deleteOne()
      })
   )

   res.status(204).json()
})
