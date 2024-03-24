import mongoose, { Schema } from 'mongoose'

const projectsCategoriesSchema = new Schema(
   {
      title: {
         type: String,
         trim: true,
         required: [true, 'title is required'],
         unique: [true, 'title should be unique'],
      },
   },
   { timestamps: true }
)

export default mongoose.models.ProjectsCategories ||
   mongoose.model('ProjectsCategories', projectsCategoriesSchema)
