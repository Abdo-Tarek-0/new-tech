import { customAlphabet } from 'nanoid'
import { OAuth2Client } from 'google-auth-library'
import UserModel from '../user/user.model.js'
import { ErrorMessage } from '../../utils/ErrorMessage.js'
import { catchError } from '../../utils/catchAsyncError.js'
import { sendGrid } from '../../utils/sendGrid.js'
import {
   generateToken,
   verifyToken,
   tokenHelpers,
} from '../../utils/GenerateAndVerifyToken.js'
import TwoFactorAuthServices from '../../services/2FA.services.js'
import mongoose from 'mongoose'

export const signUp = catchError(async (req, res) => {
   const { email } = req.body
   if (await UserModel.findOne({ email })) {
      throw new ErrorMessage(409, 'Account Already Exist 🙄')
   }
   if (req.file) {
      req.body.profilePic = req.file.dest
   }
   req.body.country = req.device.country || null
   const user = await new UserModel(req.body).save()
   if (!user) {
      throw new ErrorMessage(404, 'No User Added Check Your Data 🙄')
   }

   const token = generateToken({
      payload: {
         reason: 'CONFIRM_EMAIL',
         email,
         user: user._id,
         tokenizer: user.tokenizer,
      },
      expiresIn: tokenHelpers.standerDuration.requestConfirmEmail,
   })
   const refreshToken = generateToken({
      payload: {
         reason: 'REQUEST_CONFIRM_EMAIL',
         email,
         user: user._id,
         tokenizer: user.tokenizer,
      },
      expiresIn: tokenHelpers.standerDuration.requestNewConfirmEmail,
   })

   const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}/?isRedirect=1`
   const refreshLink = `${req.protocol}://${req.headers.host}/auth/newConfirmEmail/${refreshToken}/?isRedirect=1`

   await sendGrid({
      to: email,
      from: process.env.AUTH_SENDER_EMAIL,
      subject: 'confirmation email ',
      templateId: process.env.CONF_TEMPLATE_ID,
      data: { link, refreshLink },
   })

   res.status(201).json({
      message: 'success check your email for verification',
      data: refreshToken,
   })
})

//#### confirm email ####
export const requestNewConfirmEmail = catchError(async (req, res) => {
   const { token } = req.params
   let { isRedirect } = req.query

   const tokenData = verifyToken({ token, ignoreExpiration: true })
   isRedirect = isRedirect === '1' ? true : false

   if (
      tokenData?.reason !== 'REQUEST_CONFIRM_EMAIL' ||
      !tokenData?.email ||
      !tokenData?.user
   ) {
      if (isRedirect) {
         return res
            .status(400)
            .redirect(
               `${process.env.FRONTEND_URL}/alert/?message=Invalid Token&status=fail`
            )
      }
      throw new ErrorMessage(400, 'Token is invalid or expired 7')
   }

   const user = await UserModel.findById(tokenData?.user)

   if (!user) {
      if (isRedirect) {
         return res
            .status(404)
            .redirect(
               `${process.env.FRONTEND_URL}/alert/?message=User Not Found&status=fail`
            )
      }
      throw new ErrorMessage(404, 'User Not Found')
   }

   if (user.confirmEmail) {
      if (isRedirect) {
         return res.status(200).redirect(process.env.FRONTEND_URL)
      }
      throw new ErrorMessage(400, 'Email is already confirmed')
   }

   if (user.email !== tokenData.email) {
      if (isRedirect) {
         return res
            .status(400)
            .redirect(
               `${process.env.FRONTEND_URL}/alert/?message=Invalid Token&status=fail`
            )
      }
      throw new ErrorMessage(400, 'Token is invalid or expired 6')
   }

   if (!tokenHelpers.isTokenizerCorrect(tokenData, user.tokenizer)) {
      if (isRedirect) {
         return res
            .status(400)
            .redirect(
               `${process.env.FRONTEND_URL}/alert/?message=Invalid Token&status=fail`
            )
      }
      throw new ErrorMessage(400, 'Token is invalid or expired 5')
   }

   let numCodeRequested = user?.emailConfirmVerify?.maxNumber ?? 3
   let lastTimeCodeRequested =
      user?.emailConfirmVerify?.lastTimeRequested ?? Date.now()

   if (
      numCodeRequested <= 0 &&
      Date.now() - lastTimeCodeRequested < 24 * 60 * 60 * 1000
   ) {
      throw new ErrorMessage(
         404,
         'Sorry You Have Reached The Maximum Number Of Request Confirm Email Per Day'
      )
   } else if (numCodeRequested <= 0) {
      numCodeRequested = 3
   } else {
      numCodeRequested -= 1
   }
   lastTimeCodeRequested = Date.now()

   const newToken = generateToken({
      payload: {
         reason: 'CONFIRM_EMAIL',
         email: tokenData.email,
         user: tokenData.user,
         tokenizer: user.tokenizer,
      },
      expiresIn: tokenHelpers.standerDuration.requestConfirmEmail,
   })
   const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${newToken}/?isRedirect=1`
   const refreshLink = `${req.protocol}://${req.headers.host}/auth/newConfirmEmail/${token}/?isRedirect=1`

   const updateUserTask = UserModel.findByIdAndUpdate(tokenData.user, {
      emailConfirmVerify: {
         maxNumber: numCodeRequested,
         lastTimeRequested: lastTimeCodeRequested,
      },
   })

   const sendEmailTask = sendGrid({
      to: user.email,
      from: process.env.AUTH_SENDER_EMAIL,
      subject: 'confirmation email ',
      templateId: process.env.CONF_TEMPLATE_ID,
      data: { link, refreshLink },
   })

   await Promise.all([sendEmailTask, updateUserTask])

   if (isRedirect) {
      return res
         .status(200)
         .redirect(
            `${process.env.FRONTEND_URL}/alert/?message=Email sent again&status=success`
         )
   }
   res.status(200).json({
      message: 'success check your email for verification',
      requestNewConfirmEmail: token,
   })
})
export const confirmEmail = catchError(async (req, res) => {
   const { token } = req.params
   const tokenData = verifyToken({ token, ignoreExpiration: true })

   if (
      tokenData?.reason !== 'CONFIRM_EMAIL' ||
      !tokenData?.email ||
      !tokenData?.user
   ) {
      return res
         .status(400)
         .redirect(
            `${process.env.FRONTEND_URL}/alert/?message=Invalid Token&status=fail`
         )
   }

   const user = await UserModel.findById(tokenData?.user)

   if (!user)
      return res
         .status(404)
         .redirect(
            `${process.env.FRONTEND_URL}/alert/?message=User Not Found&status=fail`
         )

   if (user.confirmEmail)
      return res.status(200).redirect(process.env.FRONTEND_URL)

   if (user.email !== tokenData.email)
      return res
         .status(400)
         .redirect(
            `${process.env.FRONTEND_URL}/alert/?message=Invalid Token&status=fail`
         )

   if (!tokenHelpers.isTokenizerCorrect(tokenData, user.tokenizer))
      return res
         .status(400)
         .redirect(
            `${process.env.FRONTEND_URL}/alert/?message=Invalid Token&status=fail`
         )

   if (tokenHelpers.isTokenExpired(tokenData.exp))
      return res
         .status(400)
         .redirect(
            `${process.env.FRONTEND_URL}/alert/?message=Token is expired&status=fail`
         )

   user.confirmEmail = true

   const saveUserTask = user.save()

   const sendEmailTask = sendGrid({
      to: user.email,
      from: process.env.AUTH_SENDER_EMAIL,
      templateId: process.env.WELCOME_USER_TEMPLATE_ID,
      subject: 'wellcome new user',
      data: { user: user.firstName },
   })

   await Promise.all([sendEmailTask, saveUserTask])

   const accessToken = generateToken({
      payload: {
         email: user.email,
         role: user.role,
         id: user._id,
         tokenizer: user.tokenizer,
      },
      expiresIn: tokenHelpers.standerDuration.auth,
   })

   res.cookie('token', accessToken, {
      secure: true, // Ensure this is set to true if you're using HTTPS
      sameSite: 'strict', // Strict sameSite setting for additional security
      expires: new Date(Date.now() + 3600000), // 1 hour from now
   })

   return res.status(200).redirect(process.env.FRONTEND_URL)
})

//#### change email ####
export const requestChangeEmail = catchError(async (req, res) => {
   const { _id } = req.user
   const { email, password } = req.body

   const user = await UserModel.findById(_id).select('+password')

   if (!user) {
      throw new ErrorMessage(404, 'User Not Found')
   }
   if (!(await user.isCorrectPassowrd(password, user.password)))
      throw new ErrorMessage(404, 'Password is incorrect')

   if (user.email === email) throw new ErrorMessage(404, 'Email is the same')

   let numCodeRequested = user?.emailChangeVerify?.maxNumber ?? 3
   let lastTimeCodeRequested =
      user?.emailChangeVerify?.lastTimeRequested ?? Date.now()

   if (
      numCodeRequested <= 0 &&
      Date.now() - lastTimeCodeRequested < 24 * 60 * 60 * 1000
   ) {
      throw new ErrorMessage(
         404,
         'Sorry You Have Reached The Maximum Number Of Change Email Code Per Day'
      )
   } else if (numCodeRequested <= 0) {
      numCodeRequested = 3
   } else {
      numCodeRequested -= 1
   }

   lastTimeCodeRequested = Date.now()

   const token = generateToken({
      payload: {
         reason: 'CHANGE_EMAIL',
         oldEmail: user.email,
         newEmail: email,
         user: user._id,
         tokenizer: user.tokenizer,
      },
      expiresIn: tokenHelpers.standerDuration.requestChangeEmail,
   })

   const link = `${req.protocol}://${req.headers.host}/auth/confirmChangeEmail/${token}`
   const sendEmailTask = sendGrid({
      to: email,
      from: process.env.AUTH_SENDER_EMAIL,
      subject: 'confirmation email ',
      templateId: process.env.CONF_TEMPLATE_ID,
      data: { link, refreshLink: '' },
   })

   const updateUserTask = UserModel.findByIdAndUpdate(_id, {
      emailChangeVerify: {
         maxNumber: numCodeRequested,
         lastTimeRequested: lastTimeCodeRequested,
      },
   })

   await Promise.all([sendEmailTask, updateUserTask])

   return res.status(200).json({
      message: 'success check your email for verification',
   })
})
export const confirmChangeEmail = async (req, res) => {
   try {
      const { token } = req.params
      const tokenData = verifyToken({ token, ignoreExpiration: true })
      const redirectUrl = process.env.FRONTEND_URL

      if (
         !tokenData ||
         !tokenData?.reason ||
         tokenData?.reason !== 'CHANGE_EMAIL'
      )
         throw new ErrorMessage(400, 'Token is invalid or expired')

      const userTask =  UserModel.findById(tokenData?.user)
      const isEmailExistTask =  UserModel.findOne({
         email: tokenData.newEmail,
      })

      const [user, isEmailExist] = await Promise.all([userTask, isEmailExistTask])

      if (!user) throw new ErrorMessage(400, 'User Not Found')
      if (tokenHelpers.isTokenExpired(tokenData.exp))
         throw new ErrorMessage(400, 'Token is expired')
      if (!tokenHelpers.isTokenizerCorrect(tokenData, user.tokenizer))
         throw new ErrorMessage(400, 'Tokenizer is invalid or expired')
      if (user.email !== tokenData.oldEmail)
         throw new ErrorMessage(400, 'Email is changed already')
      if (isEmailExist) throw new ErrorMessage(400, 'Email already exists')

      user.email = tokenData.newEmail
      user.confirmEmail = true
      user.tokenizer = user?.issueTokenizer()
      user.oldEmails = [
         ...(user?.oldEmails || []),
         {
            email: tokenData.oldEmail,
            dateOfChange: Date.now(),
         },
      ]

      const saveUserTask = user.save()
      const sendEmailTask = sendGrid({
         to: tokenData.oldEmail,
         from: process.env.AUTH_SENDER_EMAIL,
         subject: 'Email Changed',
         templateId: process.env.EMAIL_CHANGED_TEMPLATE_ID,
         data: {
            firstName: user.firstName,
            email: user.email,
            ip: req.device.ip,
            geo: req.device.geo,
            agent: req.device.agent,
            'request-reset-url': `${process.env.FRONTEND_URL}`,
         },
      })

      await Promise.all([sendEmailTask, saveUserTask])

      const accessToken = generateToken({
         payload: {
            email: user.email,
            role: user.role,
            id: user._id,
            tokenizer: user.tokenizer,
         },
         expiresIn: tokenHelpers.standerDuration.auth,
      })

      const refreshToken = generateToken({
         payload: {
            email: user.email,
            role: user.role,
            id: user._id,
            tokenizer: user.tokenizer,
         },
         expiresIn: tokenHelpers.standerDuration.refresh,
      })

      res.cookie('token', accessToken, {
         secure: true, // Ensure this is set to true if you're using HTTPS
         expires: new Date(Date.now() + 3600000), // 1 hour from now
      })
      res.cookie('refreshToken', refreshToken, {
         secure: true, // Ensure this is set to true if you're using HTTPS
         expires: new Date(Date.now() + 3600000), // 1 hour from now
      })

      return res
         .status(200)
         .redirect(
            `${redirectUrl}/email-change-confirm?message=Email changed successfully&status=success`
         )
   } catch (error) {
      console.log(error)
      console.log(error.name)
      if (error.isOperational) {
         return res
            .status(error.status)
            .redirect(
               `${process.env.FRONTEND_URL}/email-change-confirm?message=${error.message}&status=fail`
            )
      }
      if (error.name === 'JsonWebTokenError') {
         return res
            .status(400)
            .redirect(
               `${process.env.FRONTEND_URL}/email-change-confirm?message=Invalid Token&status=fail`
            )
      }
      return res
         .status(500)
         .redirect(
            `${process.env.FRONTEND_URL}/email-change-confirm?message=Internal Server Error&status=fail`
         )
   }
}

export const signIn = catchError(async (req, res) => {
   const user = req.user

   if (!user.confirmEmail) {
      const requestConfirmEmail = generateToken({
         payload: {
            reason: 'REQUEST_CONFIRM_EMAIL',
            email: user.email,
            user: user._id,
            tokenizer: user.tokenizer,
         },
         expiresIn: tokenHelpers.standerDuration.requestConfirmEmail,
      })
      throw new ErrorMessage(
         401,
         'sorry you have to confirm your email first',
         ErrorMessage.CODES.EMAIL_IS_NOT_ACTIVE,
         requestConfirmEmail
      )
   }

   const accessToken = generateToken({
      payload: {
         email: user.email,
         role: user.role,
         id: user._id,
         tokenizer: user.tokenizer,
      },
      expiresIn: tokenHelpers.standerDuration.auth,
   })
   const refreshToken = generateToken({
      payload: {
         email: user.email,
         role: user.role,
         id: user._id,
         tokenizer: user.tokenizer,
      },
      expiresIn: tokenHelpers.standerDuration.refresh,
   })
   user.status = 'online'
   await user.save()
   return res
      .status(200)
      .json({ message: 'success', accessToken, refreshToken })
})

export const forgetPassword = catchError(async (req, res, next) => {
   const { email, resetCode, password } = req.body
   const user = await UserModel.findOne({ email: email })
   if (!user) {
      throw new ErrorMessage(404, 'invalid Email 🙄')
   }
   if (user.resetCode !== resetCode) {
      throw new ErrorMessage(404, "sorry there's invalid reset code 🙄")
   }

   user.password = password
   user.resetCode = ''
   user.changePasswordAt = Date.now()
   user.tokenizer = user?.issueTokenizer()
   const updatedUser = await user.save()
   return updatedUser
      ? res
           .status(200)
           .json({ message: 'success .. password changed successfully' })
      : next(new ErrorMessage(404, 'check your date'))
})

export const sendVerificationCode = catchError(async (req, res, next) => {
   const { email } = req.body
   const user = await UserModel.findOne({ email: email })

   if (!user) {
      throw new ErrorMessage(404, 'A user with this Email does not exist')
   }

   if (user.codeRequestMaxNumber === 0) {
      throw new ErrorMessage(
         404,
         'Sorry You Have Reached The Maximum Number Of Reset Code Per Day'
      )
   }
   const verficationCode = customAlphabet(process.env.CUSTOMALPHAPIT, 5)()

   const sendEmailTask =  sendGrid({
      to: email,
      from: process.env.AUTH_SENDER_EMAIL,
      subject: 'verification Code ',
      templateId: process.env.SEND_CODE_TEMPLATE_ID,
      data: {
         code: verficationCode,
         link: `${process.env.FRONTEND_URL}/forget_password/${email}/${verficationCode}/`,
      },
   })

   const updatedUserTask = UserModel.findOneAndUpdate(
      { email: email },
      {
         $set: { resetCode: verficationCode },
         $inc: { codeRequestMaxNumber: -1 },
      },
      { new: true }
   )

   const [updatedUser] = await Promise.all([
      updatedUserTask,
      sendEmailTask,
   ])
   return updatedUser
      ? res.status(200).json({
           message: 'success',
           //  code: updatedUser.resetCode
        })
      : next(new ErrorMessage(404, 'check your data'))
})

export const changePassword = catchError(async (req, res) => {
   const { oldPassword, password } = req.body
   const { email } = req.user
   const user = await UserModel.findOne({ email: email }).select('+password')

   if (!user) {
      throw new ErrorMessage(404, 'Not Registred Account')
   }

   if (!(await user.isCorrectPassowrd(oldPassword, user.password))) throw new ErrorMessage(404, 'oldPassword is wrong')


      user.passwordChangedAt = Date.now()
      user.password = password
      user.status = 'offline'
      user.tokenizer = user?.issueTokenizer()

      if (user?.facebookId || user?.googleId) {
         throw new ErrorMessage(
            404,
            "This Account Is Registered With Facebook Or Google You Can't Change Password"
         )
      }


      const saveUserTask = user.save()
      const sendEmailTask = sendGrid({
         to: email,
         from: process.env.AUTH_SENDER_EMAIL,
         subject: 'Password Changed',
         templateId: process.env.PASSWORD_CHANGED_TEMPLATE_ID,
         data: {
            firstName: user.firstName,
            ip: req.device.ip,
            geo: req.device.geo,
            agent: req.device.agent,
            'request-reset-url': `${process.env.FRONTEND_URL}/forget_password?email=${email}`,
         },
      })

      await Promise.all([sendEmailTask, saveUserTask])

           // issue new token
           const accessToken = generateToken({
            payload: {
               email,
               role: user.role,
               id: user._id,
               tokenizer: user.tokenizer,
            },
            expiresIn: tokenHelpers.standerDuration.auth,
         })
         const refreshToken = generateToken({
            payload: {
               email,
               role: user.role,
               id: user._id,
               tokenizer: user.tokenizer,
            },
            expiresIn: tokenHelpers.standerDuration.refresh,
         })

      return res.status(200).json({
         message: 'success password changed successfully',
         data: {
            accessToken,
            refreshToken,
         },
      })
})

export const loginWithProvider = catchError(async (req, res) => {
   const { accessToken } = req.user
   res.cookie('token', accessToken, {
      secure: true, // Ensure this is set to true if you're using HTTPS
      sameSite: 'strict', // Strict sameSite setting for additional security
      expires: new Date(Date.now() + 3600000), // 1 hour from now
   })

   // Send a message to the parent window
   res.setHeader('Content-Security-Policy', "script-src 'self' 'unsafe-inline'")
   const script = `
  <script>
  localStorage.setItem('authenticated', 'true');
   window.close();
  </script>
`

   res.status(200).send(`
    <html>
    <body>
    ${script}
    </body>
    </html>
  `) // Successful authentication, redirect home.
})

export const loginWithProviderFailed = catchError(async (req, res) => {
   res.redirect(process.env.FRONTEND_URL)
   // throw new ErrorMessage(401, "sorry authentication with google failed try again");
})

export const googleAuth = catchError(async (req, res) => {
   const client = new OAuth2Client()
   const ticket = await client.verifyIdToken({
      idToken: req.body.token,
      audience: process.env.GOOGLE_CLIENT_ID,
   })
   const payload = ticket.getPayload()

   if (!payload || !payload.email) {
      throw new ErrorMessage(401, 'Invalid Token')
   }

   let userTask =  UserModel.findOne({ googleId: payload.sub })
   let isEmailExistTask =  UserModel.findOne({
      email: payload.email,
      googleId: { $ne: payload.sub },
   })

   let [user, isEmailExist] = await Promise.all([userTask, isEmailExistTask])

   if (isEmailExist) {
      throw new ErrorMessage(
         401,
         'Email Already Exist, Please login with your email and password'
      )
   }

   if (!user) {
      const createUserTask = UserModel.create({
         email: payload.email,
         firstName: payload.given_name,
         lastName: payload.family_name,
         profilePic: payload.picture,
         googleId: payload.sub,
         country: req.device.country || null,
         confirmEmail: true,
         password: customAlphabet(
            process.env.CUSTOM_PASSWORD,
            Number(process.env.CUSTOM_PASSWORD_LENGTH)
         )(),
      })

      const sendEmailTask = sendGrid({
         to: user.email,
         from: process.env.AUTH_SENDER_EMAIL,
         templateId: process.env.WELCOME_USER_TEMPLATE_ID,
         subject: 'welcome new user',
         data: { user: user.firstName },
      });

      [user] = await Promise.all([createUserTask, sendEmailTask])



      const accessToken = generateToken({
         payload: {
            email: user.email,
            role: user.role,
            id: user._id,
            tokenizer: user.tokenizer,
         },
         expiresIn: tokenHelpers.standerDuration.auth,
      })

      const refreshToken = generateToken({
         payload: {
            email: user.email,
            role: user.role,
            id: user._id,
            tokenizer: user.tokenizer,
         },
         expiresIn: tokenHelpers.standerDuration.refresh,
      })

      return res.status(200).json({
         message: 'success',
         accessToken,
         refreshToken,
      })
   }

   const accessToken = generateToken({
      payload: {
         email: user.email,
         role: user.role,
         id: user._id,
         tokenizer: user.tokenizer,
      },
      expiresIn: tokenHelpers.standerDuration.auth,
   })
   const refreshToken = generateToken({
      payload: {
         email: user.email,
         role: user.role,
         id: user._id,
         tokenizer: user.tokenizer,
      },
      expiresIn: tokenHelpers.standerDuration.refresh,
   })

   return res.status(200).json({
      message: 'success',
      accessToken,
      refreshToken,
   })
})

export const ask2FA = catchError(async (req, res) => {
  const user = req.user

  if(user?.twoFactorAuth?.enabled) throw new ErrorMessage(400, '2FA is already enabled')

  const { secret , QRCode } = await TwoFactorAuthServices.generateTwoFactorAuth(user.email)

  const updatedUser = await UserModel.updateOne({
    _id: new mongoose.Types.ObjectId(user._id)
  },{
    twoFactorAuth:{
      secret,
      enabled: false,
    }
  })

  if (!updatedUser) throw new ErrorMessage(404, "User not found")


  res.json({
      message: 'success',
      data: QRCode,
  })
})

export const enable2FA = catchError(async (req, res) => {
   const user = req.user
   const { code } = req.body

   if(user?.twoFactorAuth?.enabled) throw new ErrorMessage(400, '2FA is already enabled')
   if(!user?.twoFactorAuth?.secret) throw new ErrorMessage(400, "Ask For 2FA first")


  const isValid = TwoFactorAuthServices.verifyTwoFactorAuth(code, user?.twoFactorAuth?.secret)

  if(!isValid) throw new ErrorMessage(400, "Invalid Code")
  
   const updatedUser = await UserModel.findOneAndUpdate({
      _id: new mongoose.Types.ObjectId(user._id)
   },{
      twoFactorAuth:{
        secret: user?.twoFactorAuth?.secret,
        enabled: true,
      },
      tokenizer: user?.issueTokenizer()
   }, {
      new: true
   })

   if (!updatedUser) throw new ErrorMessage(404, "User not found")

   const accessToken = generateToken({
      payload: {
         email: updatedUser.email,
         role: updatedUser.role,
         id: updatedUser._id,
         tokenizer: updatedUser.tokenizer,
      },
      expiresIn: tokenHelpers.standerDuration.auth,
   })
   const refreshToken = generateToken({
      payload: {
         email: updatedUser.email,
         role: updatedUser.role,
         id: updatedUser._id,
         tokenizer: updatedUser.tokenizer,
      },
      expiresIn: tokenHelpers.standerDuration.refresh,
   })

   res.json({
      message: 'success',
      accessToken,
      refreshToken
   })
})

export const disable2FA = catchError(async (req, res) => {
   const user = req.user
   const code = req.body.code
   
   if(!user?.twoFactorAuth?.enabled) throw new ErrorMessage(400, '2FA is already disabled')
   
   const isValid = TwoFactorAuthServices.verifyTwoFactorAuth(code, user?.twoFactorAuth?.secret)
   if(!isValid) throw new ErrorMessage(400, "Invalid Code")

   const updatedUser = await UserModel.findOneAndUpdate({
      _id: new mongoose.Types.ObjectId(user._id)
   },{
      twoFactorAuth:{
        secret: null,
        enabled: false,
      },
      tokenizer: user?.issueTokenizer()
   }, {
      new: true
   })

   if (!updatedUser) throw new ErrorMessage(404, "User not found")

   const accessToken = generateToken({
      payload: {
         email: updatedUser.email,
         role: updatedUser.role,
         id: updatedUser._id,
         tokenizer: updatedUser.tokenizer,
      },
      expiresIn: tokenHelpers.standerDuration.auth,
   })

   const refreshToken = generateToken({
      payload: {
         email: updatedUser.email,
         role: updatedUser.role,
         id: updatedUser._id,
         tokenizer: updatedUser.tokenizer,
      },
      expiresIn: tokenHelpers.standerDuration.refresh,
   })

   res.json({
      message: 'success',
      accessToken,
      refreshToken
   })
})