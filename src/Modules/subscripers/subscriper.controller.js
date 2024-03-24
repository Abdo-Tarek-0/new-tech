import client from '@sendgrid/client'
import SubscripersModel from './subscriper.model.js'
import { ErrorMessage } from '../../utils/ErrorMessage.js'
import { catchError } from '../../utils/catchAsyncError.js'
import { sendGridMultiple, sendGrid } from '../../utils/sendGrid.js'

client.setApiKey(process.env.SENDGRID_API_KEY)
export const getAllSubscripers = catchError(async (req, res) => {
   const subscripers = await SubscripersModel.find({})
   if (subscripers.length === 0) {
      throw new ErrorMessage(404, 'no subscripers found')
   }
   res.status(200).json(subscripers)
})

export const addNewSubscriper = catchError(async (req, res) => {
   const data = {
      contacts: [
         {
            email: req.body.email,
            // custom_fields: {
            //   w1: "coffee",
            //   w33: "42",
            //   e2: "blue",
            // },
         },
      ],
   }

   const sgRequest = {
      url: `/v3/marketing/contacts`,
      method: 'PUT',
      body: data,
   }

   const [resp] = await client.req(sgRequest)

   // console.log(result.body);
   if (resp.statusCode === 202) {
      return res.status(201).json({
         message: ' Subscriper Added Successfully 😃',
      })
   }
})

export const addNewGetInTouchAccount = catchError(async (req, res) => {
   const { name, phone, message, email } = req.body
   console.log(
      'from',
      process.env.GETINTOUCH_TEMPLATE_ID,
      process.env.AUTH_SENDER_EMAIL
   )
   // let subscriper = await SubscripersModel.findOne({
   //   email: req.body.email,
   // });
   // if (subscriper)
   //   return next(ErrorMessage(409, "Get In Touch Account Already Exist 🙄"));
   let result = new SubscripersModel(req.body)
   result = await result.save()
   if (result) {
      const sendEmailTask1 =  sendGrid({
         to: process.env.INFO_RECEIVER_EMAIL,
         from: process.env.INFO_SENDER_EMAIL,
         subject: 'get in touch',
         templateId: process.env.GETINTOUCH_TEMPLATE_ID,
         data: { name, phone, email, message },
      })

      const sendEmailTask2 = sendGrid({
         to: email,
         from: process.env.INFO_SENDER_EMAIL,
         subject: 'get in touch',
         templateId: process.env.GETINTOUCH_FOR_USER_TEMPLATE_ID,
         data: { name },
      })

      await Promise.all([sendEmailTask1, sendEmailTask2])
      
      return res.status(201).json({
         message: 'Add  Successfully 😃',
         result,
      })

      // console.error(err.res.body.errors);
      // console.log(err);
   }
   throw new ErrorMessage(
      400,
      "Get In Touch Account doesn't created check data you provide"
   )
})
export const broadcastEmailToAllSubscripers = catchError(async (req, res) => {
   const { from, message } = req.body
   let ids = await SubscripersModel.find({}).select({ email: 1, _id: 0 })
   if (ids.length === 0) {
      throw new ErrorMessage(404, 'no subscripers found')
   }

   ids = ids.map((id) => ({
      to: id.email,
      from: from || process.env.AUTH_SENDER_EMAIL,
      dynamicTemplateData: { message },
      templateId: process.env.SUBSCRIPER_TEMPLATE_ID,
      subject: 'New Updates from Tech Logit',
   }))

   await sendGridMultiple({
      emails: ids,
   })
   // console.log(result);
   res.status(200).json({ message: 'email sent successfully' })
})
