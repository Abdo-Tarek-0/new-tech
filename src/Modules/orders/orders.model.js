import mongoose, { Types, Schema, model } from 'mongoose'

const workStatusSchema = new Schema(
   {
      title: String,
      completed: Boolean,
      description: String,
   },
   { timestamps: true }
)

const orderSchema = new Schema(
   {
      title: {
         type: String,
         trim: true,
         required: [true, 'title is required'],
         minLength: [1, 'too short  name'],
      },

      user: { type: Types.ObjectId, ref: 'User' },
      pages: { type: Number, min: 1 },
      status: {
         type: String,
         enum: [
            'recieved',
            'gathering-information',
            'on-progress',
            'completed',
         ],
         default: 'recieved',
      },
      image: { type: String, default: 'uploads/services/Group 1 1844 (1).png' },
      payment: {
         type: String,
         enum: ['unpaid', 'refunded', 'paid', 'failed'],
         default: 'unpaid',
      },
      originPrice: {
         type: String,
         default: '',
      },
      chossen: {
         type: [],
         default: [],
      },
      userInfo: {},
      projectDetails: {
         type: String,
         default:
            'On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue',
      },

      workStatus: { type: [workStatusSchema], default: [] },
      updatedBy: { type: Types.ObjectId, ref: 'User' },
      totalPrice: { type: Number, required: [true, 'totalPrice is required'] },
      service: { type: Types.ObjectId, ref: 'Services' },
      isDeleted: { type: Boolean, default: false },
      device: {
         type: {
            ip: String,
            agent: String,
            geo: String,
            country: String,
         },
         required: true,
         select: false,
      }
   },
   { timestamps: true }
)

orderSchema.pre('find', async function (next) {
   this.populate({ path: 'service' })
   next()
})

orderSchema.pre('findOne', async function (next) {
   this.populate({ path: 'service' })
   next()
})

export default mongoose.models.Orders || model('Orders', orderSchema)
