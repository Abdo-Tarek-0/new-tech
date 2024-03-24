import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { customAlphabet } from 'nanoid'

const randomString = customAlphabet(process.env.CUSTOMALPHAPIT, 8)


const trustedIP = new mongoose.Schema(
   {
      ip: String,
      lastTimeUsed: Date,
   },
   { _id: false }
)

const trustedDevice = new mongoose.Schema(
   {
      userAgent: String,
      id: String,
      addAt: { type: Date, default: ()=> Date.now()},
   },
   { _id: false }
)

const userSchema = mongoose.Schema(
   {
      firstName: {
         type: String,
         trim: true,
         required: true,
         minLength: [1, 'too short user name'],
      },
      lastName: {
         type: String,
         trim: true,

         // minLength: [1, "too short user name"],
      },
      email: {
         type: String,
         trim: true,
         required: true,
         minLength: 1,
         unique: [true, 'email must be unique'],
      },
      password: {
         type: String,
         required: true,
         minLength: [6, 'minLength 6 characters'],
         select: false,
      },
      changePasswordAt: Date,
      phone: {
         type: String,
      },
      profilePic: String,
      role: {
         type: String,
         enum: ['user', 'tech', 'admin'],
         default: 'user',
      },
      orders: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Orders',
            default: [],
         },
      ],
      status: {
         type: String,
         enum: ['offline', 'online'],
         default: 'offline',
      },
      confirmEmail: {
         type: Boolean,
         default: false,
      },
      country: String,
      suspend: { type: Boolean, default: false },
      resetCode: { type: String, default: '' },
      gender: { type: String, enum: ['male', 'female'], default: 'male' },
      googleId: { type: String },
      facebookId: { type: String },
      isSuperAdmin: { type: Boolean, default: false },
      ContactInformation: {
         firstName: {
            type: String,
            default: '',
            trim: true,
         },
         lastName: {
            type: String,
            default: '',
            trim: true,
         },
         address: {
            type: String,
            default: '',
            trim: true,
         },
         country: {
            type: String,
            default: '',
            trim: true,
         },
         city: {
            type: String,
            default: '',
            trim: true,
         },
      },
      codeRequestMaxNumber: { type: Number, default: 3 },
      tokenizer: { type: String, default: randomString() },
      oldEmails: [
         {
            email: { type: String },
            dateOfChange: { type: Date, default: Date.now() },
         },
      ],

      emailChangeVerify: {
         maxNumber: { type: Number, default: 3 },
         lastTimeRequested: { type: Date, default: Date.now() },
      },
      emailConfirmVerify: {
         maxNumber: { type: Number, default: 3 },
         lastTimeRequested: { type: Date, default: Date.now() },
      },
      forgetPasswordVerify: {
         maxNumber: { type: Number, default: 3 },
         lastTimeRequested: { type: Date, default: Date.now() },
      },

      twoFactorAuth: {
         type: {
            secret: {
               type: String,
               default: '',
               select: false,
            },
            enabled: {
               type: Boolean,
               default: false,
            },
            trustedIPs: { 
               type: [trustedIP],
               default: [],
               select: false,
            },
            trustedDevices: {
               type: [trustedDevice],
               default: [],
               select: false,
            }
         },
         default: {},
    
      },
   },

   { timestamps: true }
)

userSchema.pre('save', async function () {
   if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 12)
      // this.tokenizer = randomString()
   }
})

userSchema.pre('/^update/', async function () {
   if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 12)
      // this.tokenizer = randomString()
   }
})
userSchema.pre('find', async function (next) {
   this.populate({
      path: 'orders',
      populate: { path: 'service', model: 'Services' },
   })
   next()
})

userSchema.pre('find', async function (next) {
   this.populate({
      path: 'orders',
      populate: { path: 'service', model: 'Services' },
   })
   next()
})

userSchema.methods.isCorrectPassowrd = async function (
   candidatePassword,
   userPassword
) {
   return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.issueTokenizer = function () {
   return randomString()
}

export default mongoose.models.User || mongoose.model('User', userSchema)
