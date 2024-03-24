import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import cron from "node-cron";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import passport from "passport";
import compression from 'compression'
import requestID from 'express-request-id';
import resBuilder from "./src/middleware/response.builder.middleware.js";
import device from './src/middleware/device.js'
import { dbConnectionAndServer } from "./dbAndServer/dbConnectionAndServer.js";
import allRoutes from "./src/Modules/index.routes.js";
import stripe from "stripe";
import OrdersModel from "./src/Modules/orders/orders.model.js";
import PaymentHistoryModel from "./src/Modules/PaymentsHistory/paymentsHistory.model.js";
// import { sendGrid } from "./src/utils/sendGrid.js";

//set directory dirname
// const server = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "./config/.env") });
// dotenv.config();
// console.log("send grid key", process.env.SENDGRID_API_KEY);

const app = express();

const allowedOrigins = [
  "https://techlogit.com",
  "https://dashboard.techlogit.com",
  "http://localhost:5173",
  "https://tech-logit-1sff.vercel.app/",
  "https://tech-logit-dashboard.vercel.app/",
];

// CORS options
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// Use CORS with specified options
// app.use(cors(corsOptions));
app.use(cors({
  origin: '*',
  exposedHeaders: 'x-device-id'
}));
app.use(requestID());
app.use(resBuilder());
//------------------------------------------------------webhook------------------------------------------------------
app.use(helmet());
// Create an instance of the rate limiter with desired options
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 50000, // limit each IP to 500 requests per windowMs
  validate: {trustProxy: false}
});

// Apply the rate limiting middleware to all requests
app.use(limiter);
app.set('trust proxy', true );
passport.initialize();
app.use(cookieParser());
app.use(mongoSanitize());
app.use(compression())
app.use(device);
// app.use(xss());
dbConnectionAndServer(app);

app.use(morgan("dev"));
//?express middleware
const stripeSecretKey = process.env.STRIPE_SECRET;
const stripeInstance = new stripe(stripeSecretKey);
const endpointSecret = process.env.WEBHOOK_SECRET;

// -------------------------------------------webhook-----------------------------------------------------------------
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),

  async (request, response) => {
    const sig = request.headers["stripe-signature"].toString();
    let event;
    try {
      event = stripeInstance.webhooks.constructEvent(
        request.body,
        sig,
        endpointSecret.toString()
      );
      console.log("event", JSON.stringify(event, null, 2));
      console.log("event", JSON.stringify(event.data.object, null, 2));
      let variantName = "default variant";

      switch (event.type) {
        // -------------------------------------------function to handle the event payment_intent.succeeded-----------
        case "payment_intent.succeeded":
          const paymentIntentSucceeded = event.data.object;
          const order = await OrdersModel.findByIdAndUpdate(
            { _id: paymentIntentSucceeded.metadata.orderId },
            { $set: { payment: "paid", status: "gathering-information" } },
            { new: true }
          );
          const { chossen } = order;
          variantName = "default variant";

          const paymentMethod = await stripeInstance.paymentMethods.retrieve(
            paymentIntentSucceeded.payment_method
          ); 


          await PaymentHistoryModel.create({
            title: order.title,
            message: `${order.title} payment succeeded`,
            user: order.user,
            order: order._id,
            status: "success",
            brand: paymentMethod?.card?.brand,
            last4:  paymentMethod?.card?.last4,
            amountInCents: paymentIntentSucceeded.amount,
            currency: paymentIntentSucceeded.currency,
          });

 

          if (chossen.length > 0) {
            variantName = chossen
              .flatMap((item) =>
                Object.values(item).map((subItem) => subItem.title)
              )
              .map((obj) => {
                return Object.entries(obj)
                  .map(([key, value]) => `${key} ${value}`)
                  .join(" ");
              })
              .join(" ");
          }

          // await sendGrid({
          //   to: paymentIntentSucceeded.metadata.customerEmail,
          //   from: process.env.ORDER_SENDER_EMAIL,
          //   subject: "order creation ",
          //   templateId: process.env.ORDER_STATUS_CHANGED_USER_TEMPLATE_ID,
          //   data: {
          //     orderID: paymentIntentSucceeded.metadata.orderId,
          //     userName: paymentIntentSucceeded.metadata.customer_name,
          //     variationName: variantName,
          //     price: paymentIntentSucceeded.amount,
          //     currency: paymentIntentSucceeded.currency,
          //     paymentMethod: "card",
          //     status: "paid",
          //   },
          // });

          // await sendGrid({
          //   to: process.env.INFO_RECEIVER_EMAIL,
          //   from: process.env.ORDER_SENDER_EMAIL,
          //   subject: "order creation ",
          //   templateId: process.env.ORDER_STATUS_CHANGED_ADMIN_TEMPLATE_ID,
          //   data: {
          //     orderID: paymentIntentSucceeded.metadata.orderId,
          //     userName: "Admin",
          //     variationName: variantName,
          //     price: paymentIntentSucceeded.amount,
          //     currency: paymentIntentSucceeded.currency,
          //     paymentMethod: "card",
          //     status: "paid",
          //     email: paymentIntentSucceeded.metadata.customerEmail,
          //     orderOwnerName: paymentIntentSucceeded.metadata.customer_name,
          //   },
          // });

          response.status(200).send({
            message: "Payment successed",
            paymentIntentSucceeded,
          });
          break;
        //----------------------------------------- function to handle the event payment_intent.payment_failed--------------
        case "payment_intent.payment_failed":
          const paymentIntentPaymentFailed = event.data.object;
          const failedOrder = await OrdersModel.findByIdAndUpdate(
            { _id: paymentIntentPaymentFailed.metadata.orderId },
            { $set: { payment: "failed", status: "recieved" } },
            { new: true }
          );
          // console.log("failedOrder", paymentIntentPaymentFailed.last_payment_error)

          const { chossen: choosen } = failedOrder;
          variantName = "default variant";

          await PaymentHistoryModel.create({
            title: failedOrder.title,
            message: paymentIntentPaymentFailed?.last_payment_error?.message,
            user: failedOrder.user,
            order: failedOrder._id,
            status: "failed",
            brand: paymentIntentPaymentFailed?.last_payment_error?.payment_method?.card?.brand,
            last4: paymentIntentPaymentFailed?.last_payment_error?.payment_method?.card?.last4,
            amountInCents: paymentIntentPaymentFailed?.amount,
            currency: paymentIntentPaymentFailed?.currency,
          });

          if (choosen.length > 0) {
            variantName = choosen
              .flatMap((item) =>
                Object.values(item).map((subItem) => subItem.title)
              )
              .map((obj) => {
                return Object.entries(obj)
                  .map(([key, value]) => `${key} ${value}`)
                  .join(" ");
              })
              .join(" ");
          }
          // await sendGrid({
          //   to: paymentIntentPaymentFailed.metadata.customerEmail,
          //   from: process.env.ORDER_SENDER_EMAIL,
          //   subject: "order creation ",
          //   templateId: process.env.ORDER_STATUS_CHANGED_USER_TEMPLATE_ID,
          //   data: {
          //     orderID: paymentIntentPaymentFailed.metadata.orderId,
          //     userName: paymentIntentPaymentFailed.metadata.customer_name,
          //     variationName: variantName,
          //     price: paymentIntentPaymentFailed.amount,
          //     currency: paymentIntentPaymentFailed.currency,
          //     paymentMethod: "card",
          //     status: "failed",
          //   },
          // });

          // await sendGrid({
          //   to: process.env.INFO_RECEIVER_EMAIL,
          //   from: process.env.ORDER_SENDER_EMAIL,
          //   subject: "order creation ",
          //   templateId: process.env.ORDER_STATUS_CHANGED_ADMIN_TEMPLATE_ID,
          //   data: {
          //     orderID: paymentIntentPaymentFailed.metadata.orderId,
          //     userName: "Admin",
          //     variationName: variantName,
          //     price: paymentIntentPaymentFailed.amount,
          //     currency: paymentIntentPaymentFailed.currency,
          //     paymentMethod: "card",
          //     status: "failed",
          //     email: paymentIntentPaymentFailed.metadata.customerEmail,
          //     orderOwnerName: paymentIntentPaymentFailed.metadata.customer_name,
          //   },
          // });

          response.status(200).send({
            message: "payment Intent failed",
            paymentIntentPaymentFailed,
          });

          break;
        //------------------------------------------- function to handle the event payment_intent.canceled---------------------
        case "payment_intent.canceled":
          const paymentIntentCanceled = event.data.object;
          const updatedOrder = await OrdersModel.findByIdAndUpdate(
            { _id: paymentIntentCanceled.metadata.orderId },
            { $set: { payment: "failed", status: "recieved" } },
            { new: true }
          ).populate({
            path: "user",
            select: { email: 1, firstName: 1, lastName: 1 },
          });
          const { chossen: chosssen } = updatedOrder;
          variantName = "default variant";

          const paymentMethodCanceled = await stripeInstance.paymentMethods.retrieve(
            paymentIntentCanceled.payment_method
          );

          await PaymentHistoryModel.create({
            title: updatedOrder.title,
            message: "payment canceled",
            user: updatedOrder.user,
            order: updatedOrder._id,
            status: "cancelled",
            brand: paymentMethodCanceled.card.brand,
            last4: paymentMethodCanceled.card.last4,
            amountInCents: paymentIntentCanceled.amount,
            currency: paymentIntentCanceled.currency,
          });

          if (chosssen.length > 0) {
            variantName = chosssen
              .flatMap((item) =>
                Object.values(item).map((subItem) => subItem.title)
              )
              .map((obj) => {
                return Object.entries(obj)
                  .map(([key, value]) => `${key} ${value}`)
                  .join(" ");
              })
              .join(" ");
          }
          
        // await sendGrid({
        //   to: updatedOrder.user.email,
        //   from: process.env.ORDER_SENDER_EMAIL,
        //   subject: "order creation ",
        //   templateId: process.env.ORDER_STATUS_CHANGED_USER_TEMPLATE_ID,
        //   data: {
        //     orderID: updatedOrder._id,
        //     userName: `${updatedOrder.user.firstName} ${updatedOrder.user.lastName}`,
        //     variationName: variantName,
        //     price: paymentIntentCanceled?.amount || "",
        //     currency: paymentIntentCanceled?.currency || "",
        //     paymentMethod: "card",
        //     status: "failed",
        //   },
        // });

        // await sendGrid({
        //   to: process.env.INFO_RECEIVER_EMAIL,
        //   from: process.env.ORDER_SENDER_EMAIL,
        //   subject: "order creation ",
        //   templateId: process.env.ORDER_STATUS_CHANGED_ADMIN_TEMPLATE_ID,
        //   data: {
        //     orderID: updatedOrder._id,
        //     userName: "Admin",
        //     variationName: variantName,
        //     price: paymentIntentCanceled?.amount || "",
        //     currency: paymentIntentCanceled?.currency || "",
        //     paymentMethod: "card",
        //     status: "failed",
        //     email: updatedOrder.user.email,
        //     orderOwnerName: `${updatedOrder.user.firstName} ${updatedOrder.user.lastName}`,
        //   },
        // });
        // response.status(200).send({
        //   message: "payment Intent Canceled",
        //   paymentIntentCanceled,
        // });
        // break;
        //-------------------------------------------  function to handle the event refund.created--------------------------

        case "charge.refund.updated":
          const chargeRefundUpdated = event.data.object;
          if (chargeRefundUpdated.status === "succeeded") {
            const paymentIntent = await stripeInstance.paymentIntents.retrieve(
              chargeRefundUpdated.payment_intent
            );
            if (
              paymentIntent &&
              paymentIntent.metadata &&
              paymentIntent.metadata.orderId
            ) {
              const orderId = paymentIntent.metadata.orderId;
              // Update the order's payment status to "unpaid" if the refund succeeded

              const updatedOrder = await OrdersModel.findByIdAndUpdate(
                { _id: orderId },
                { $set: { payment: "refunded", status: "recieved" } },
                { new: true }
              ).populate({
                path: "user",
                select: { email: 1, firstName: 1, lastName: 1 },
              });
              const { chossen } = updatedOrder;
              let variantName = "default variant";

              const paymentMethodRefunded = await stripeInstance.paymentMethods.retrieve(
                chargeRefundUpdated.payment_method
              );

              await PaymentHistoryModel.create({
                title: updatedOrder.title,
                message: "payment refunded",
                user: updatedOrder.user,
                order: updatedOrder._id,
                status: "refunded",
                brand: paymentMethodRefunded.card.brand,
                last4: paymentMethodRefunded.card.last4,
                amountInCents: chargeRefundUpdated.amount,
                currency: chargeRefundUpdated.currency,
              });

              if (chossen.length > 0) {
                variantName = chossen
                  .flatMap((item) =>
                    Object.values(item).map((subItem) => subItem.title)
                  )
                  .map((obj) => {
                    return Object.entries(obj)
                      .map(([key, value]) => `${key} ${value}`)
                      .join(" ");
                  })
                  .join(" ");
              }
              try {
                // await sendGrid({
                //   to: updatedOrder.user.email,
                //   from: process.env.ORDER_SENDER_EMAIL,
                //   subject: "order creation ",
                //   templateId: process.env.ORDER_STATUS_CHANGED_USER_TEMPLATE_ID,
                //   data: {
                //     orderID: orderId,
                //     userName: `${updatedOrder.user.firstName} ${updatedOrder.user.lastName}`,
                //     variationName: variantName,
                //     price: chargeRefundUpdated.amount,
                //     currency: chargeRefundUpdated.currency,
                //     paymentMethod: "card",
                //     status: "refunded",
                //   },
                // });
                // await sendGrid({
                //   to: process.env.INFO_RECEIVER_EMAIL,
                //   from: process.env.ORDER_SENDER_EMAIL,
                //   subject: "order creation ",
                //   templateId: process.env.ORDER_STATUS_CHANGED_ADMIN_TEMPLATE_ID,
                //   data: {
                //     orderID: chargeRefundUpdated.metadata.orderId,
                //     userName: "Admin",
                //     variationName: "web development",
                //     price: chargeRefundUpdated.amount,
                //     currency: chargeRefundUpdated.currency,
                //     paymentMethod: "card",
                //     status: "refunded",
                //     email: updatedOrder.user.email,
                //     orderOwnerName: `${updatedOrder.user.firstName} ${updatedOrder.user.lastName}`,
                //   },
              } catch (err) {
                response.status(200).send({
                  error: err,
                });
              }

              response.status(200).send({
                message:
                  "Refund status updated to succeeded; Order payment status updated to refunded",
              });
            } else {
              response.status(400).send({ message: "Order ID not found" });
            }
          } else if (chargeRefundUpdated.status === "failed") {
            // Handle the case where the refund failed
            console.error(
              `Refund failed: ${chargeRefundUpdated.failure_reason}`
            );
            // You can send notifications or take other appropriate actions
            response
              .status(200)
              .send({ message: "Refund status updated to failed" });
          } else {
            // Handle other refund status updates as needed
            response.status(200).send({
              message: `Refund status updated: ${chargeRefundUpdated.status}`,
            });
          }
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (err) {
      console.log("webhook Error", err.message);
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
  }
);

//------------------------------------------------------------------------------------------------------------

app.use(express.json());
//? route for accessing images on server
app.use("/uploads", express.static(path.join(__dirname, "./src/uploads/")));

//? all route
allRoutes(app, express);
// export { io };

//* to request server every 10 min to prevent sleep issues
//! do not deleted it
cron.schedule("*/10 * * * *", async () => {
  await axios.get("https://techlogit.onrender.com");
});
