import Stripe from 'stripe'
import passport from 'passport'
import mongoose from 'mongoose'
import userRoute from './user/userRoute.js'
import authRoute from './auth/auth.router.js'
import categoriesRoute from './categories/categories.router.js'
import projectsCategoriesRoute from './projectsCategories/projectsCategories.router.js'
import paymentsHistoryRoute from './PaymentsHistory/paymentsHistory.routes.js'
import homeRoute from './home/home.router.js'
import ordersRoute from './orders/orders.router.js'
import servicesRoute from './services/services.router.js'
import subscripersRoute from './subscripers/subscriper.router.js'
import statisticsRoute from './statistics/statistics.router.js'
import ProjectsRoute from './projects/projects.router.js'
import reviewsRoute from './reviews/reviews.router.js'
import messagesRoute from './messages/messages.router.js'
import conversationsRoute from './conversations/conversations.router.js'
import attachmentRoute from './attachments/attachments.router.js'
import { ErrorMessage } from '../utils/ErrorMessage.js'
import facebookStrategy from './auth/facebook.strategy.js'
import googleStrategy from './auth/google.strategy.js'
import CardsModel from './Cards/Cards.Model.js'
import auth, { checkSameUser } from '../middleware/auth.js'
import { resetUserMaxCodeRequest } from '../utils/cron-jops/userCronJop.js'
import socketCache from '../services/cache.services/socket.cache.js'

const stripeSecretKey = process.env.STRIPE_SECRET
const stripeInstance = new Stripe(stripeSecretKey)

export default function allRoutes(app, express) {
   passport.initialize()
   passport.use(facebookStrategy)
   passport.use(googleStrategy)
   app.use(express.json({}))
   app.get('/', (req, res) => {
      console.log(socketCache.getUsers())
      res.json({
         message: 'Welcome to the API',
         device: req.device,
      })
   })
   app.use('/auth', authRoute)
   app.use('/user', userRoute)
   app.use('/categories', categoriesRoute)
   app.use('/projectsCategories', projectsCategoriesRoute)
   app.use('/projects', ProjectsRoute)
   app.use('/home', homeRoute)
   app.use('/orders', ordersRoute)
   app.use('/services', servicesRoute)
   app.use('/subscripers', subscripersRoute)
   app.use('/statistics', statisticsRoute)
   app.use('/reviews', reviewsRoute)
   app.use('/conversations', conversationsRoute)
   app.use('/messages', messagesRoute)
   app.use('/attachments', attachmentRoute)
   app.use('/paymentsHistory', paymentsHistoryRoute)

   //-------------------------------------------------------Stripe----------------------------------------------
   app.post('/create-payment-intent', async (req, res) => {
      const { amount, customerId, orderId, email, name } = req.body
      const existingCustomer = await stripeInstance.customers.list({
         email: req.body.email,
         limit: 1,
      })
      let customer
      if (existingCustomer.data.length > 0) {
         customer = existingCustomer.data[0]
      } else {
         // Customer doesn't exist, create a new one
         customer = await stripeInstance.customers.create({
            name: name,
            email: email,
         })
      }
      const paymentIntent = await stripeInstance.paymentIntents.create({
         amount: amount,
         currency: 'usd',
         customer: customer.id,
         setup_future_usage: 'off_session',
         automatic_payment_methods: {
            enabled: true,
         },
         metadata: {
            customer_id: customerId,
            customer_name: name,
            orderId: orderId,
            customerEmail: email,
         },
      })

      res.send({
         clientSecret: paymentIntent.client_secret,
         stripeCustomer: customer.id,
      })
   })
   //-------------------------------------------------------Stripe express checkout----------------------------------------------
   app.post('/create-payment-intent-express', async (req, res) => {
      const { amount, customerId, orderId, email, name } = req.body
      const existingCustomer = await stripeInstance.customers.list({
         email: req.body.email,
         limit: 1,
      })
      let customer
      if (existingCustomer.data.length > 0) {
         customer = existingCustomer.data[0]
      } else {
         customer = await stripeInstance.customers.create({
            name: name,
            email: email,
         })
      }
      const paymentIntent = await stripeInstance.paymentIntents.create({
         amount: amount,
         currency: 'usd',
         customer: customer.id,
         automatic_payment_methods: {
            enabled: true,
         },
         metadata: {
            customer_id: customerId,
            customer_name: name,
            orderId: orderId,
            customerEmail: email,
         },
      })
      res.send({
         clientSecret: paymentIntent.client_secret,
         stripeCustomer: customer.id,
      })
   })
   //---------------------------------------- Save card details--------------------------------------------
   app.post('/save-Card', auth('admin', 'user', 'tech'), async (req, res) => {
      try {
         const { paymentMethodId, stripeCustomer } = req.body
         const { _id } = req.user

         const existingCard = await CardsModel.findOne({
            paymentMethodId,
            customerId: new mongoose.Types.ObjectId(_id),
         })
         if (existingCard) {
            return res
               .status(400)
               .json({ message: 'Card details already exist' })
         }
         await stripeInstance.paymentMethods.attach(paymentMethodId, {
            customer: stripeCustomer,
         })
         const paymentMethod =
            await stripeInstance.paymentMethods.retrieve(paymentMethodId)

         console.log('Card', paymentMethod.card)

         const { brand, last4, exp_month, exp_year } = paymentMethod.card
         const card = new CardsModel({
            paymentMethodId,
            customerId: new mongoose.Types.ObjectId(_id),
            stripeCustomer,
            last4,
            brand,
            expMonth: exp_month,
            expYear: exp_year,
            type: paymentMethod.card.funding,
         })
         await card.save()
         res.status(200).json({ message: 'Card details saved successfully' })
      } catch (error) {
         console.error(error)
         res.status(500).json({
            message: 'An error occurred while saving the card details',
         })
      }
   })

   app.delete(
      '/delete-card/:id',
      auth('admin', 'user', 'tech'),
      async (req, res) => {
         try {
            const { id } = req.params
            const { _id } = req.user

            const card = await CardsModel.findOne({
               _id: new mongoose.Types.ObjectId(id),
               customerId: new mongoose.Types.ObjectId(_id),
            })
            if (!card) {
               return res.status(404).json({ message: 'Card not found' })
            }
            await stripeInstance.paymentMethods.detach(card.paymentMethodId)
            await card.deleteOne()
            res.status(200).json({ message: 'Card deleted successfully' })
         } catch (error) {
            console.error(error)
            res.status(500).json({
               message: 'An error occurred while deleting the card',
            })
         }
      }
   )

   app.post(
      '/setup-intent',
      auth('admin', 'user', 'tech'),
      async (req, res) => {
         try {
            const { email, name } = req.decoded
            const existingCustomer = await stripeInstance.customers.list({
               email: email,
               limit: 1,
            })

            let customer
            if (existingCustomer.data.length > 0) {
               customer = existingCustomer.data[0]
            } else {
               // Customer doesn't exist, create a new one
               customer = await stripeInstance.customers.create({
                  name: name,
                  email: email,
               })
            }

            const setupIntent = await stripeInstance.setupIntents.create({
               customer: customer.id,
            })

            res.status(200).json({
               status: 'success',
               clientSecret: setupIntent.client_secret,
               customerId: customer.id,
            })
         } catch (error) {
            console.error(error)
            res.status(500).json({
               message: 'An error occurred while creating a setup intent',
            })
         }
      }
   )
   //-----------------------------------------------Get saved card details-----------------------------------------
   // Get saved card details for a customer
   app.get(
      '/:userId/saved-cards',
      auth('user', 'admin', 'tech'),
      checkSameUser(),
      async (req, res) => {
         try {
            const { userId } = req.params
            const cards = await CardsModel.find({ customerId: userId })
            res.status(200).json(cards)
         } catch (error) {
            console.error(error)
            res.status(500).json({
               message: 'An error occurred while retrieving saved card details',
            })
         }
      }
   )
   //! Not Found Page
   //----------------------------------------------------------------------------------------------------------------------
   app.use((request, response, next) => {
      next(new ErrorMessage(404, `Not found - ${request.originalUrl}`))
   })

   //! to catch any error
   app.use((error, request, response, next) => {
      console.log(error)
      response.status(error.statusCode || 500).json({
         error: error.message,
         message: error.message,
         statusError: error.status,
         status: error.statusCode,
         CODE: error.code,
         data: error.data,
      })
   })
}
///////////////////cron jop for reset max number of reset code request////////////////////////
resetUserMaxCodeRequest()
