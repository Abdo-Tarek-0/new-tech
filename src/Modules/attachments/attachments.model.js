import mongoose, { Types, Schema } from 'mongoose'

const schema = new Schema(
   {
      senderId: {
         type: Types.ObjectId,
         ref: 'User',
      },
      encoding: String,
      mimetype: String, // 'video/mp4',
      destination: String, //'uploads/messages/pz6cJBuooqUt95ZLB-QPe_GR-10-sec-ad.mp4',
      filename: String, // pz6cJBuooqUt95ZLB-QPe_GR-10-sec-ad.mp4,
      originalname: String, // '10-sec-ad.mp4',
      size: Number,
   },
   { timestamps: true }
)

export default mongoose.models.Attachment ||
   mongoose.model('Attachment', schema)
