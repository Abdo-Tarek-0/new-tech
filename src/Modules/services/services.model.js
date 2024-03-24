import mongoose, { Types, Schema, model } from 'mongoose'

const detailsSchema = new mongoose.Schema({
   content: {
      type: String,
      trim: true,
      minLength: [1, 'too short  description'],
   },
})
const variationSchema = new mongoose.Schema({
   name: {
      //new service name
      type: String,
      trim: true,
      required: [true, 'name is required'],
      minLength: [2, 'too short  name'],
   },
   title: {
      //dorpdown item name
      type: String,
      trim: true,
      required: [true, 'name is required'],
      minLength: [2, 'too short  name'],
   },
   topDescription: {
      type: String,
      trim: true,
      required: [true, 'fullDescription is required'],
      minLength: [10, 'too short  fullDescription'],
   },
   price: {
      type: Number,
      required: [true, 'price is required'],
   },
   largeImage: {
      type: String,
      required: [true, 'largeImage is required'],
   },
   dropDownnNameId: {
      type: Types.ObjectId,
   },
})
const dropDownnNameSchema = new mongoose.Schema({
   title: {
      type: String,
      trim: true,
   },
})
const mixedPricesSchema = new mongoose.Schema({
   variationsId: [
      {
         type: Types.ObjectId,
         trim: true,
      },
   ],
   price: {
      type: Number,
   },
})

const serviceSchema = new Schema(
   {
      defaultName: {
         type: String,
         trim: true,
         required: [true, 'name is required'],
         minLength: [2, 'too short  name'],
      },
      defaultTopDescription: {
         type: String,
         trim: true,
         required: [true, 'fullDescription is required'],
         minLength: [5, 'too short  fullDescription'],
      },
      defaultPrice: {
         type: Number,
         required: [true, 'price is required'],
      },
      defaultLargeImage: {
         type: String,
         required: [true, 'largeImage is required'],
      },
      dropDownnNames: {
         type: [dropDownnNameSchema],
         maxLength: [2, 'there is just 2 variations available'],
         minLength: [1, 'variations should be at least 1 '],
      },
      variations: [variationSchema],
      botDescription: {
         type: String,
         trim: true,
         required: [true, 'fullDescription is required'],
         minLength: [5, 'too short  fullDescription'],
      },
      oldWork: [
         {
            type: Types.ObjectId,
            ref: 'Projects',
         },
      ],
      category: {
         type: Types.ObjectId,
         ref: 'Categories',
      },
      smallImage: {
         type: String,
         required: [true, 'smallImage is required'],
      },
      miniDescription: {
         type: String,
         trim: true,
         required: [true, 'miniDescription is required'],
         minLength: [5, 'too short  miniDescription'],
      },
      discount: {
         type: Number,
         min: 0,
         max: 100,
         default: 0,
      },
      leftDetailsTitle: {
         type: String,
         required: [true, 'smallImage is required'],
      },
      leftDetailsItems: [detailsSchema],
      rightDetailsTitle: {
         type: String,
         required: [true, 'smallImage is required'],
      },
      rightDetailsItems: [detailsSchema],
      mixedPrices: [mixedPricesSchema],
      // smallImage: { type: { url: String, publicId: String } },
      // largeImage: { type: { url: String, publicId: String } },
   },
   { timestamps: true, strictPopulate: false }
)

export default mongoose.models.Services || model('Services', serviceSchema)
