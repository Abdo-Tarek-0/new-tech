import { ErrorMessage } from '../../utils/ErrorMessage.js'
import { catchError } from '../../utils/catchAsyncError.js'
import UserModel from './user.model.js'
import { deleteOne, deleteMany } from '../../utils/factory.js'
import ApiFeature from '../../utils/ApiFeature.js'

const createUser = catchError(async (req, res, next) => {
   const user = await UserModel.findOne({ email: req.body.email })
   if (user) return next(new ErrorMessage(409, 'Account Already Exist 🙄'))
   req.body.confirmEmail = true
   if (req.file) {
      req.body.profilePic = req.file.dest
   }
   let result = new UserModel(req.body)
   result = await result.save()
   if (result) {
      return res.status(201).json({
         message: 'Add New User Successfully 😃',
         result,
      })
   }
   throw new ErrorMessage(400, "user doesn't created check data you provide")
})

const getAllUser = catchError(async (req, res) => {
   const apiFeature = new ApiFeature(UserModel.find(), req.query)

      .fields()
      .search()
      .filter()
      .sort()
   // .paginate();
   // console.log(apiFeature);
   //? execute query
   const result = await apiFeature.mongooseQuery

   // const results = await cloned;
   // let results = await apiFeature.totalCount;
   // console.log(results);
   res.status(200).json({
      message: 'Done 😃',
      result,
      totalCount: apiFeature.totalCount,
   })
})
const getUser = catchError(async (req, res, next) => {
   const { id } = req.params
   const result = await UserModel.findById(id).populate('orders')
   if (!result) {
      return next(new ErrorMessage(404, `User Not Found 😥`))
   }
   res.status(200).json({
      message: 'Done 😃',
      result,
   })
})

const updateUser = catchError(async (req, res, next) => {
   const { id } = req.params
   const { password } = req.body
   if (password) {
      req.body.changePasswordAt = Date.now()
   }
   if (req.file) {
      req.body.profilePic = req.file.dest
   }
   const result = await UserModel.findByIdAndUpdate(id, req.body, {
      new: true,
   })
   if (!result) {
      return next(new ErrorMessage(404, `User Not Found 😥`))
   }
   res.status(200).json({
      message: 'Done 😃',
      result,
   })
})
const updateContactInfo = catchError(async (req, res, next) => {
   const { id } = req.params

   try {
      const updatedFields = req.body
      if (!updatedFields) {
         return next(
            new ErrorMessage(400, 'ContactInformation fields are required')
         )
      }
      const result = await UserModel.findByIdAndUpdate(
         id,
         {
            $set: { ContactInformation: { ...updatedFields } },
         },
         { new: true }
      )
      if (!result) {
         return next(new ErrorMessage(404, `User Not Found 😥`))
      }
      res.status(200).json({
         message: 'Contact Information Updated 😃',
         result,
      })
   } catch (error) {
      return next(new ErrorMessage(500, 'Internal Server Error'))
   }
})

const suspendUsers = catchError(async (req, res, next) => {
   const { ids, suspend } = req.body
   const suspendedUsers = []

   const promises = ids.map(async (id) => {
      const result = await UserModel.findByIdAndUpdate(
         id,
         { suspend },
         { new: true }
      )
      if (result) {
         suspendedUsers.push(result)
      }
   })

   await Promise.all(promises)

   if (suspendedUsers.length === 0) {
      return next(new ErrorMessage(404, `Users Not Found 😥`))
   }
   res.status(200).json({
      message: 'Done 😃',
      suspendedUsers,
   })
})
const changeUserPassword = catchError(async (req, res, next) => {
   const { id } = req.params
   req.body.changePasswordAt = Date.now()
   const result = await UserModel.findByIdAndUpdate(id, req.body, {
      new: true,
   })
   if (!result) {
      return next(new ErrorMessage(404, `User Not Found 😥`))
   }
   res.status(200).json({
      message: 'Done  password changed successfully😃',
      result,
   })
})

export const changeProfileImage = catchError(async (req, res) => {
   const { _id } = req.user

   const user = await UserModel.findById(_id)

   if (req.file) {
      user.profilePic = req.file.dest
   } else {
      user.profilePic = null
   }
   await user.save()
   return res.status(200).json({ message: 'success', user })
})

export const changeBasicInfo = catchError(async (req, res) => {
   const { _id } = req.user
   const user = await UserModel.findByIdAndUpdate(_id, req.body, {
      new: true,
   })
   return res.status(200).json({ message: 'success', user })
})

const deleteUser = deleteOne(UserModel)
const deleteUsers = deleteMany(UserModel)

export {
   createUser,
   getAllUser,
   getUser,
   updateUser,
   suspendUsers,
   deleteUser,
   deleteUsers,
   changeUserPassword,
   updateContactInfo,
}
