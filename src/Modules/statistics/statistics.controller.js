import { catchError } from '../../utils/catchAsyncError.js'
import OrdersModel from '../orders/orders.model.js'
import ServicesModel from '../services/services.model.js'
import UserModel from '../user/user.model.js'

export const getUserInfo = catchError(async (req, res) => {
   const suspendedUserCountTask = UserModel.countDocuments({
      suspend: false,
      role: 'user',
   })
   const userCountTask = UserModel.countDocuments({ role: 'user' })
   const activeUserCountTask =  UserModel.countDocuments({
      suspend: true,
      role: 'user',
   })
   const allSystemUserCountTask =  UserModel.countDocuments()
   const systemAdminCountTask =  UserModel.countDocuments({ role: 'admin' })

   const activeAdminCountTask =  UserModel.countDocuments({
      suspend: false,
      role: 'admin',
   })
   const suspendedAdminCountTask =  UserModel.countDocuments({
      suspend: true,
      role: 'admin',
   })

   const systemTechCountTask =  UserModel.countDocuments({ role: 'tech' })

   const activeTechCountTask =  UserModel.countDocuments({
      suspend: false,
      role: 'tech',
   })
   const suspendedTechCountTask =  UserModel.countDocuments({
      suspend: true,
      role: 'tech',
   })

   const [
      allSystemUserCount,
      userCount,
      activeUserCount,
      suspendedUserCount,
      systemAdminCount,
      activeAdminCount,
      suspendedAdminCount,
      systemTechCount,
      activeTechCount,
      suspendedTechCount,
   ] = await Promise.all([
      allSystemUserCountTask,
      userCountTask,
      activeUserCountTask,
      suspendedUserCountTask,
      systemAdminCountTask,
      activeAdminCountTask,
      suspendedAdminCountTask,
      systemTechCountTask,
      activeTechCountTask,
      suspendedTechCountTask,
   ])

   res.status(201).json({
      message: 'success',
      userStat: {
         allSystemUserCount,
         userCount,
         activeUserCount,
         suspendedUserCount,
         systemAdminCount,
         activeAdminCount,
         suspendedAdminCount,
         systemTechCount,
         activeTechCount,
         suspendedTechCount,
      },
   })
})

export const getServicesInfo = catchError(async (req, res) => {
   const servicesCountTask = ServicesModel.countDocuments()

   const mostPurchasedServiceTask = OrdersModel.aggregate([
      { $match: { isDeleted: false } },
      {
         $group: {
            _id: '$service',
            count: { $sum: 1 },
         },
      },
      { $sort: { count: -1 } },
      // { $limit: 1 },
      {
         $lookup: {
            from: 'services', // replace with the name of your services collection
            localField: '_id',
            foreignField: '_id',
            as: 'service',
         },
      },
      { $unwind: '$service' },
      { $project: { service: 1, count: 1, _id: 0 } },
   ])

   const [servicesCount, mostPurchasedService] = await Promise.all([
      servicesCountTask,
      mostPurchasedServiceTask,
   ])
   res.status(201).json({
      message: 'success',
      serviceStat: { servicesCount, mostPurchasedService },
   })
})

export const getOrderInfo = catchError(async (req, res) => {
   const orderCountTask =  OrdersModel.countDocuments({
      isDeleted: false,
   })
   const paidOrderCountTask =  OrdersModel.countDocuments({
      payment: 'paid',
      isDeleted: false,
   })

   const totalMoneyTask =  OrdersModel.aggregate([
      { $match: { isDeleted: false } },
      {
         $group: {
            _id: null,
            totalMoney: { $sum: '$totalPrice' },
         },
      },
   ])

   const groupedMoneyTask =  OrdersModel.aggregate([
      {
         $match: {
            isDeleted: false,
         },
      },
      {
         $group: {
            _id: '$payment',
            totalMoney: { $sum: '$totalPrice' },
         },
      },
   ])

   const [orderCount, paidOrderCount, totalMoney, groupedMoney] = await Promise.all([
      orderCountTask,
      paidOrderCountTask,
      totalMoneyTask,
      groupedMoneyTask,
   ])

   res.status(201).json({
      message: 'success',
      orderStat: {
         orderCount,
         paidOrderCount,
         unpaidOrderCount: orderCount - paidOrderCount,
         totalMoney: totalMoney[0].totalMoney,
         paidOrderMoney: groupedMoney[0],
         unpaidOrderMoney: groupedMoney[1],
      },
   })
})
