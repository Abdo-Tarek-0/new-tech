import mongoose, { Types, Schema } from 'mongoose'

const schema = new Schema(
   {
      content: String,
      sender: {
         // id
         type: Types.ObjectId,
         ref: 'User',
      },
      conversation: {
         // id
         type: Types.ObjectId,
         ref: 'Conversations',
         required: true,
      },
      seen: {
         type: Boolean,
         default: false,
      },
      attachments: [
         {
            type: Types.ObjectId,
            ref: 'Attachment',
         },
      ],
      isFromAdmin: {
         type: Boolean,
         default: false,
      },
      local_id: Number, // this is an id from the start of the conversation to the end ex: 0,1,2,3,4,5,6,7,8,9,10,...271 , etc
      links: [
         {
            type: String,
         },
      ],
   },
   { timestamps: true }
)

// text search index on content
schema.index({ content: 'text' })

export default mongoose.models.Messages || mongoose.model('Messages', schema)
