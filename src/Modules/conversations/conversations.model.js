import mongoose, { Types, Schema } from 'mongoose'

const schema = new Schema(
   {
      order: {
         type: Types.ObjectId,
         ref: 'Orders',
         required: true,
      },
      client: {
         type: Types.ObjectId,
         ref: 'User',
         required: true,
      },
      lastMessageOn: Date,
      lastMessage: {
         content: {
            type: String,
         },
         isFromAdmin: Boolean,
         messageId: {
            type: Types.ObjectId,
            ref: 'Messages',
         },
      },
      userNotes: String,
      AdminNotes: String,
   },
   { timestamps: true }
)
export default mongoose.models.Conversations ||
   mongoose.model('Conversations', schema)
