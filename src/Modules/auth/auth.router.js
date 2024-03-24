import { Router } from 'express'
import passport from 'passport'
import { fileUpload, fileValidation } from '../../utils/multer.js'
import * as authController from './auth.controller.js'
import * as authValidator from './auth.validation.js'
import { validation } from '../../middleware/validation.js'
import auth from '../../middleware/auth.js'
// import captchaCheck from '../../middleware/captchaCheck.middleware.js'
import { login2FA, verify2FA } from '../../middleware/2fa.middleware.js'


const router = Router()

router.post(
   '/signup',
   //captchaCheck,
   fileUpload('profilePic', fileValidation.image).single('image'),
   validation(authValidator.signUpSchema),
   authController.signUp
)
router.get(
   '/confirmEmail/:token',
   validation(authValidator.tokenSchema),
   authController.confirmEmail
)
router.get(
   '/newConfirmEmail/:token',
   validation(authValidator.tokenSchema),
   authController.requestNewConfirmEmail
)

router.post(
   '/requestChangeEmail',
   auth('user', 'admin', 'tech'),
   verify2FA('must'),
   validation(authValidator.requestChangeEmailSchema),
   authController.requestChangeEmail
)

router.get('/confirmChangeEmail/:token', authController.confirmChangeEmail)

router.post(
   '/signin',
   validation(authValidator.signInSchema),
   login2FA,
   // captchaCheck,
   authController.signIn
)

router.post(
   '/sendcode',
   //captchaCheck,
   validation(authValidator.sendVerificationCodeSchema),
   authController.sendVerificationCode
)

router.post(
   '/forgetpassword',
   validation(authValidator.forgetPasswordSchema),
   authController.forgetPassword
)

router.patch(
   '/changepassword',
   auth('user', 'admin', 'tech'),
   verify2FA('must'),
   validation(authValidator.changePasswordSchema),
   authController.changePassword
)

router.post('/googleAuth', authController.googleAuth)


router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }))
router.get(
   '/facebook/callback',
   passport.authenticate('facebook', {
      failureRedirect: '/auth/failed/facebook',
      session: false,
   }),
   authController.loginWithProvider
)
router.get('/failed/facebook', authController.loginWithProviderFailed)

router.get(
   '/google',
   passport.authenticate('google', { scope: ['email', 'profile'] })
)

router.get(
   '/google/callback',

   passport.authenticate('google', {
      session: false,
      // successRedirect: "/",
      failureRedirect: '/auth/failed/google',
   }),
   authController.loginWithProvider
)
router.get('/failed/google', authController.loginWithProviderFailed)

router.post('/ask2FA' , auth('user', 'admin', 'tech'), authController.ask2FA)
router.post('/enable2FA' , auth('user', 'admin', 'tech'), validation(authValidator.enable2FASchema), authController.enable2FA)
router.post('/disable2FA' , auth('user', 'admin', 'tech'), validation(authValidator.disable2FASchema), authController.disable2FA)

export default router