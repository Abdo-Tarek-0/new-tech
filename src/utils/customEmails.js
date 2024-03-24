import { sendGrid } from './sendGrid.js'

function convertVariants(data) {
   const result = []
   for (const obj of data) {
      for (const key in obj) {
         const innerObj = obj[key]
         const { title } = innerObj
         for (const variant in title) {
            result.push({
               variant: variant,
               value: title[variant],
               originPrice: innerObj.originPrice,
            })
         }
      }
   }
   return result
}

export const sendOrderCanceledEmailUser = async ({ order, to }) => {
   await sendGrid({
      to,
      from: process.env.ORDER_SENDER_EMAIL,
      subject: 'order canceled ',
      templateId: process.env.ORDER_CANCELED_USER_TEMPLATE_ID,
      data: {
         orderID: order.id,
         userName: order.userInfo.firstName,
         variationName: order?.chossen ? convertVariants(order?.chossen) : [],
         title: order.title,
         price: order.totalPrice,
      },
   })
}
