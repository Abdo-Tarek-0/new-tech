import mongoose, { Types, Schema, model } from 'mongoose'

const paymentHistorySchema = new Schema(
   {
      title: {
         type: String,
         trim: true,
         required: [true, 'title is required'],
      },
      message: {
         type: String,
         trim: true,
         default: 'Payment',
      },
      user: { type: Types.ObjectId, ref: 'User' },
      order: { type: Types.ObjectId, ref: 'Orders' },
      status: {
         type: String,
         enum: ['success', 'refunded', 'cancelled', 'failed'],
         default: 'success',
      },
      brand: { type: String, required: [true, 'card brand is required'] },
      last4: { type: String, required: [true, 'last 4 digits is required'] },

      amountInCents: { type: Number, required: [true, 'amount is required'] },
      currency: { type: String, required: [true, 'currency is required'] },
   },
   { timestamps: true }
)

// paymentHistorySchema.pre('find', async function (next) {
//     this.populate({ path: 'user', select: 'firstName lastName email -orders'})
//     this.populate({ path: 'order', select: 'title status payment originPrice projectDetails totalPrice service image workStatus'})
//     next()
// })

// paymentHistorySchema.pre('findOne', async function (next) {
//     this.populate({ path: 'user', select: 'firstName lastName email -orders' } )
//     this.populate({ path: 'order', select: 'title status payment originPrice projectDetails totalPrice service image workStatus' })
//     next()
// })

export default mongoose.models.PaymentHistory ||
   model('PaymentHistory', paymentHistorySchema)
