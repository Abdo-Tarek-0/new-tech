import mongoose, { Schema } from 'mongoose'

const categoriesSchema = new Schema(
   {
      title: {
         type: String,
         trim: true,
         required: [true, 'title is required'],
         unique: [true, 'title should be unique'],
      },
      icon: {
         type: String,
         trim: true,
         required: [true, 'icon is required'],
      },
      image: {
         type: String,
      },
      description: {
         type: String,
      },
   },
   { timestamps: true }
)

export default mongoose.model('Categories', categoriesSchema)
