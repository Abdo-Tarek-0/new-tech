import mongoose, { Schema } from 'mongoose'

const schema = new Schema(
   {
      csName: {
         type: String,
         trim: true,
         required: [true, 'csName is required'],
      },
      csJobTitle: {
         type: String,
         trim: true,
         required: [true, 'csJobTitle is required'],
      },
      review: {
         type: String,
         trim: true,
         required: [true, 'review is required'],
      },
      image: {
         type: String,
      },
      rating: {
         type: Number,
      },
   },
   { timestamps: true }
)

export default mongoose.models.Reviews || mongoose.model('Reviews', schema)
