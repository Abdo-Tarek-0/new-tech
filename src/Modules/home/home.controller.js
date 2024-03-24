import HomeModel from './home.model.js'
import { ErrorMessage } from '../../utils/ErrorMessage.js'
import { catchError } from '../../utils/catchAsyncError.js'
import Projects from '../projects/projects.model.js'
import CategoriesModel from '../categories/categories.model.js'
import mongoose from 'mongoose'

export const getHome = catchError(async (req, res) => {
   const homeDetails = await HomeModel.findOne()
      .populate({
         path: 'ourServices',
      })
      .populate({
         path: 'latestProjects',
         populate: {
            path: 'projectCategory',
         },
      })
   if (!homeDetails) {
      throw new ErrorMessage(404, 'no categories found')
   }
   res.status(200).json(homeDetails)
})

export const updateHome = catchError(async (req, res) => {
   const updatedHome = await HomeModel.updateOne({
      _id: mongoose.Types.ObjectId('650dde1cc3475a4faa798240'),
   }, req.body)
   if (updatedHome.matchedCount === 0) {
      throw new ErrorMessage(404, "category id doesn't exist 🙄")
   }
   res.status(201).json({ message: 'home is updated successfully..!' })
})

export const addService = catchError(async (req, res) => {
   const category = await CategoriesModel.findOne({
      _id: req.params.serviceId,
   })
   if (!category) {
      throw new ErrorMessage(404, 'No such category id exists')
   }
   const updatedServices = await HomeModel.updateOne(
      {
         _id: mongoose.Types.ObjectId('650dde1cc3475a4faa798240'),
      },
      {
         $addToSet: { ourServices: req.params.serviceId },
      }
   )
   if (updatedServices.matchedCount === 0) {
      throw new ErrorMessage(404, 'error finding home document')
   }
   res.status(201).json({
      message: 'category is posted to our services successfully..!',
   })
})

export const deleteService = catchError(async (req, res) => {
   const updatedServices = await HomeModel.updateOne(
      {
         _id: mongoose.Types.ObjectId('650dde1cc3475a4faa798240'),
      },
      { $pull: { ourServices: req.params.serviceId } }
   )
   if (updatedServices.matchedCount === 0) {
      throw new ErrorMessage(404, "service id doesn't exist 🙄")
   }
   res.status(201).json({
      message: 'service is deleted from our services successfully..!',
   })
})

export const addProject = catchError(async (req, res) => {
   const project = await Projects.findOne({
      _id: req.params.projectId,
   })
   if (!project) {
      throw new ErrorMessage(404, 'No such project id exists')
   }
   const updatedProjects = await HomeModel.updateOne(
      {
         _id: mongoose.Types.ObjectId('650dde1cc3475a4faa798240'),
      },
      {
         $addToSet: { latestProjects: req.params.projectId },
      }
   )
   if (updatedProjects.matchedCount === 0) {
      throw new ErrorMessage(404, 'error finding home document')
   }
   res.status(201).json({
      message: 'project is posted to latest projects successfully..!',
   })
})

export const deleteProject = catchError(async (req, res) => {
   const updatedProjects = await HomeModel.updateOne(
      {
         _id: mongoose.Types.ObjectId('650dde1cc3475a4faa798240'),
      },
      { $pull: { latestProjects: req.params.projectId } }
   )
   if (updatedProjects.matchedCount === 0) {
      throw new ErrorMessage(404, "service id doesn't exist 🙄")
   }
   res.status(201).json({
      message: 'project is deleted from latest projects successfully..!',
   })
})
export const addClient = catchError(async (req, res) => {
   Object.keys(req.files).forEach((file) => {
      const [image] = req.files[file]
      req.body[file] = image.dest
   })
   const updatedClients = await HomeModel.updateOne(
      {
         _id: mongoose.Types.ObjectId('650dde1cc3475a4faa798240'),
      },
      {
         $addToSet: { clients: req.body.clientImage },
      }
   )
   if (updatedClients.matchedCount === 0) {
      throw new ErrorMessage(404, 'error finding home document')
   }
   const newlyAddedClient = req.body.clientImage

   res.status(201).json({
      message: 'client is posted to our clients successfully..!',
      data: newlyAddedClient,
   })
})

export const deleteClient = catchError(async (req, res) => {
   const updatedClients = await HomeModel.updateOne(
      {
         _id: mongoose.Types.ObjectId('650dde1cc3475a4faa798240'),
      },
      { $pull: { clients: req.body.imageName } }
   )
   if (updatedClients.matchedCount === 0) {
      throw new ErrorMessage(404, "service id doesn't exist 🙄")
   }
   res.status(201).json({
      message: 'client is deleted from our clients successfully..!',
   })
})

export const updateHeader = catchError(async (req, res) => {
   if (req.files) {
      Object.keys(req.files).forEach((file) => {
         const [image] = req.files[file]
         req.body[file] = image.dest
      })
   }
   if (req.body) {
      const updatedData = {
         $set: {
            'getStarted.title': req.body.title,
            'getStarted.description': req.body.description,
            'getStarted.image': req.body.image,
            'getStarted.videoUrl': req.body.videoUrl,
         },
      }
      const data = await HomeModel.findByIdAndUpdate(
         { _id: '650dde1cc3475a4faa798240' },
         updatedData,
         { new: true }
      ).select('getStarted')
      if (data.nModified === 0) {
         return res.status(404).json({ message: 'Home not found' })
      }
      res.status(201).json({
         message: 'Header data updated successfully',
         data,
      })
   } else {
      return res
         .status(400)
         .json({ error: 'Invalid FormData or missing fields' })
   }
})

export const updateAboutUs = catchError(async (req, res) => {
   if (req.files) {
      Object.keys(req.files).forEach((file) => {
         const [image] = req.files[file]
         req.body[file] = image.dest
      })
   }
   if (req.body) {
      const updatedData = {
         $set: {
            'aboutUs.title': req.body.title,
            'aboutUs.description': req.body.description,
            'aboutUs.image': req.body.image,
         },
      }
      const data = await HomeModel.findByIdAndUpdate(
         { _id: '650dde1cc3475a4faa798240' },
         updatedData,
         { new: true }
      ).select('aboutUs')
      if (data.nModified === 0) {
         return res.status(404).json({ message: 'Home not found' })
      }
      res.status(201).json({
         message: 'AboutUs data updated successfully',
         data,
      })
   } else {
      return res
         .status(400)
         .json({ error: 'Invalid FormData or missing fields' })
   }
})

export const updateContact = catchError(async (req, res) => {
   if (req.body) {
      const updatedData = {
         $set: {
            'contact.bigTitle': req.body.bigTitle,
            'contact.smallTitle': req.body.smallTitle,
            'contact.description': req.body.description,
            'contact.phone': req.body.phone,
            'contact.mail': req.body.mail,
            'contact.location': req.body.location,
            'contact.facebook': req.body.facebook,
            'contact.insta': req.body.insta,
            'contact.discord': req.body.discord,
            'contact.linkedin': req.body.linkedin,
         },
      }
      const data = await HomeModel.findByIdAndUpdate(
         { _id: '650dde1cc3475a4faa798240' },
         updatedData,
         { new: true }
      ).select('contact')
      if (data.nModified === 0) {
         return res.status(404).json({ message: 'Home not found' })
      }
      res.status(201).json({
         message: 'Contact data updated successfully',
         data,
      })
   } else {
      return res
         .status(400)
         .json({ error: 'Invalid FormData or missing fields' })
   }
})

export const updateWhyChooseUs = catchError(async (req, res) => {
   if (!req.body) {
      return res
         .status(400)
         .json({ error: 'Invalid FormData or missing fields' })
   }
   const home = await HomeModel.findById('650dde1cc3475a4faa798240')

   if (!home) {
      return res.status(404).json({ message: 'Home not found' })
   }
   const updateData = { ...home._doc }

   if (req.files.whyChooseUsImage) {
      updateData.whyChooseUs.image = req.files.whyChooseUsImage[0].dest
   }
   if (req.body.whyChooseUsTitle) {
      updateData.whyChooseUs.title = req.body.whyChooseUsTitle
   }

   const reasonNames = ['first', 'second', 'third', 'fourth']

   reasonNames.forEach((reason) => {
      if (req.body[`${reason}Title`]) {
         updateData.whyChooseUs.reasons[reason].title =
            req.body[`${reason}Title`]
      }

      if (req.body[`${reason}Description`]) {
         updateData.whyChooseUs.reasons[reason].description =
            req.body[`${reason}Description`]
      }

      if (req.files && req.files[`${reason}Image`]) {
         updateData.whyChooseUs.reasons[reason].image =
            req.files[`${reason}Image`][0].dest
      }
   })
   await HomeModel.findByIdAndUpdate('650dde1cc3475a4faa798240', updateData, {
      new: true,
   }).select('whyChooseUs')
   res.status(201).json({
      message: 'whyChooseUs data updated successfully',
      whyChooseUs: updateData.whyChooseUs,
   })
})

export const getFAQs = catchError(async (req, res) => {
   const home = await HomeModel.findById('650dde1cc3475a4faa798240')

   if (!home) {
      return res.status(404).json({ message: 'Home not found' })
   }

   const FAQs = home._doc.frequentlyAskedQuestions || []

   res.status(200).json({
      message: 'FAQs fetched successfully',
      data: FAQs,
   })
})

export const addFAQ = catchError(async (req, res) => {
   const home = await HomeModel.findById('650dde1cc3475a4faa798240')

   if (!home) {
      return res.status(404).json({ message: 'Home not found' })
   }

   const FAQs = home._doc.frequentlyAskedQuestions || []
   FAQs.push(req.body)

   await HomeModel.findByIdAndUpdate(
      '650dde1cc3475a4faa798240',
      { frequentlyAskedQuestions: FAQs },
      {
         new: true,
      }
   ).select('frequentlyAskedQuestions')
   
   res.status(201).json({
      message: 'FAQ added successfully',
      data: FAQs,
   })
})

export const updateFAQ = catchError(async (req, res) => {
   const FAQid = req.params.id

   const home = await HomeModel.findById('650dde1cc3475a4faa798240')
 
   if (!home) {
      return res.status(404).json({ message: 'Home not found' })
   }

   const FAQs = home._doc.frequentlyAskedQuestions || []


   const FAQIndex = FAQs.findIndex((FAQ) => FAQ?._id?.toString() === FAQid)

   if (FAQIndex === -1) {
      return res.status(404).json({ message: 'FAQ not found' })
   }

   const FAQ = FAQs[FAQIndex]

   FAQ.question = req.body.question || FAQ.question
   FAQ.answer = req.body.answer || FAQ.answer

   await HomeModel.findByIdAndUpdate(
      '650dde1cc3475a4faa798240',
      { frequentlyAskedQuestions: FAQs },
      {
         new: true,
      }
   ).select('frequentlyAskedQuestions')

   res.status(201).json({
      message: 'FAQ updated successfully',
      data: FAQs,
   })

})

export const deleteFAQ = catchError(async (req, res) => {
   const FAQid = req.params.id

   const home = await HomeModel.findById('650dde1cc3475a4faa798240')

   if (!home) {
      return res.status(404).json({ message: 'Home not found' })
   }

   const FAQs = (home._doc.frequentlyAskedQuestions || []).filter((FAQ)=>{
      return FAQ?._id?.toString() !== FAQid
   })

   await HomeModel.findByIdAndUpdate(
      '650dde1cc3475a4faa798240',
      { frequentlyAskedQuestions: FAQs },
      {
         new: true,
      }
   ).select('frequentlyAskedQuestions')

   res.status(201).json({
      message: 'FAQ deleted successfully',
      data: FAQs,
   })
})