import mongoose, { Types, Schema } from 'mongoose'
import slugify from 'slugify'

const projectsSchema = new Schema(
   {
      title: {
         type: String,
         trim: true,
         required: [true, 'title is required'],
         unique: [true, 'title should be unique'],
      },
      description: {
         type: String,
         trim: true,
         required: [true, 'fullDescription is required'],
         minLength: [5, 'too short  fullDescription'],
      },
      projectCategory: {
         type: Types.ObjectId,
         ref: 'ProjectsCategories',
      },
      smallImage: {
         type: String,
         required: [true, 'smallImage is required'],
      },
      largeImage: {
         type: String,
         required: [true, 'largeImage is required'],
      },
      previewImages: {
         type: [String],
         required: [true, 'previewImages is required'],
      },
      largePreviewImage: {
         type: String,
         required: [true, 'largePreviewImage is required'],
      },
      videoUrl: {
         type: String,
      },
      additionalInfo: {
         type: String,
         trim: true,
         required: [true, 'addetionalInfo is required'],
         minLength: [5, 'too short  addetionalInfo'],
      },
      slugTitle: {
         type: String,
         // required: [true, 'slugTitle is required'],
         unique: [true, 'slugTitle should be unique'],
      },
   },
   { timestamps: true }
)

projectsSchema.pre('save', function (next) {
   this.slugTitle = slugify(this.title, { lower: true })
   next()
})

projectsSchema.pre('/^update/', function (next) {
   this.slugTitle = slugify(this.title, { lower: true })
   next()
})

export default mongoose.models.Projects ||
   mongoose.model('Projects', projectsSchema)
