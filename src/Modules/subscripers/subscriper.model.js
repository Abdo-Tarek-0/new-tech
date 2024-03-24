import mongoose, { Schema } from 'mongoose'

const subscripersSchema = new Schema(
   {
      email: {
         type: String,
         trim: true,
         required: true,
         minLength: 1,
         // unique: [true, "email must be unique"],
      },
      name: { type: String, required: true, minLength: 1 },
      phone: { type: String, minLength: 5 },
      message: { type: String, required: true, minLength: 5 },
   },
   { timestamps: true }
)

export default mongoose.models.Subscripers ||
   mongoose.model('Subscripers', subscripersSchema)
