import sgMail from '@sendgrid/mail'

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../config/.env') })

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const sendGrid = ({ to, from, subject, data, templateId } = {}) => {
   const msg = {
      to,
      from, // Use the email address or domain you verified above
      subject,
      templateId,
      dynamicTemplateData: data,
   }
   // const msg = {
   //   to: "test8@gmail.com",
   //   from: "Test@techlogit.com", // Use the email address or domain you verified above
   //   subject: "Sending with Twilio SendGrid is Fun",

   //   templateId: "d-99d6e1a2c07c41c68164e3a7ee830e72",
   //   dynamicTemplateData: {
   //     userName: "John Doe",
   //     orderID: "johndoe123",
   //   },
   // };
   return sgMail.send(msg)
}

export const sendGridMultiple = ({ emails } = {}) => sgMail.sendMultiple(emails)

//ES6
// sgMail.send(msg).then(
//   () => {},
//   (error) => {
//     console.error(error);

//     if (error.response) {
//       console.error(error.response.body);
//     }
//   }
// );
//ES8
// };
