import mongoose, { Types, Schema, model } from 'mongoose'

const variationSchema = new mongoose.Schema({
   serviceId: {
      type: Types.ObjectId,
      ref: 'Services',
      required: [true, 'serviceId is required'],
   },
   name: {
      type: String,
      trim: true,
      required: [true, 'name is required'],
      minLength: [2, 'too short  name'],
   },
   description: {
      type: String,
      trim: true,
      required: [true, 'description is required'],
      minLength: [2, 'too short  description'],
   },
   type: {
      type: String,
      enum: ['select-multi', 'select-single', 'input-num'],
      required: [true, 'type is required'],
   },
   isOptional: {
      type: Boolean,
      default: true,
   },
   values: [
      {
         type: {
            name: {
               type: String,
               trim: true,
               required: [true, 'name is required'],
               minLength: [2, 'too short  name'],
            },
            price: {
               type: Number,
               required: [true, 'price is required'],
            },
         },
      },
   ],
   minValue: {
      type: Number,
   },
   maxValue: {
      type: Number,
   },
   step: {
      type: Number,
   },
   priceBerStep: {
      type: Number,
   },
})

export default mongoose.models.Variations || mongoose.model('Variations', variationSchema)