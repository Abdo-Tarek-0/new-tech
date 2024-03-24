import Projects from './projects.model.js'
import ProjectsCategories from '../projectsCategories/projectsCategories.model.js'
import { ErrorMessage } from '../../utils/ErrorMessage.js'
import { catchError } from '../../utils/catchAsyncError.js'

export const getAllProjects = catchError(async (req, res) => {
   const projects = await Projects.find().populate({
      path: 'projectCategory',
   })
   if (projects.length === 0) {
      throw new ErrorMessage(404, 'no Projects found')
   }
   res.status(200).json(projects)
})

export const getSingleProject = catchError(async (req, res) => {
   const project = await Projects.findOne(
      { slugTitle: req.params.projectId },
      {
         _id: 1,
         title: 1,
         slugTitle: 1,
         additionalInfo: 1,
         createdAt: 1,
         videoUrl: 1,
         previewImages: 1,
         largePreviewImage: 1,
      }
   )
   if (!project) {
      throw new ErrorMessage(404, 'no Projects found')
   }
   res.status(200).json(project)
})

export const getcategoryProjects = catchError(async (req, res) => {
   const categoryTask = ProjectsCategories.findOne({
      _id: req.params.categoryId,
   })
   const projectsTask = Projects.find({
      projectCategory: req.params.categoryId,
   })

   const [category, projects] = await Promise.all([categoryTask, projectsTask])
   if (!category) {
      throw new ErrorMessage(404, 'No such category id exists')
   }
   if (projects.length === 0) {
      throw new ErrorMessage(404, 'no projects found for this category')
   }
   res.status(200).json(projects)
})

export const addProject = catchError(async (req, res) => {
   const projectCategory = await ProjectsCategories.findOne({
      _id: req.body.projectCategory,
   })
   if (!projectCategory) {
      throw new ErrorMessage(404, 'No such project category id exists')
   }
   Object.keys(req.files).forEach((file) => {
      const [image] = req.files[file]
      req.body[file] = image.dest
   })
   req.body.previewImages = req.files.previewImages.map((image) => image.dest)
   if (req.body.previewImages.length > 3 || req.body.previewImages.length < 3) {
      throw new ErrorMessage(400, 'Please add 3 preview images only')
   }
   const newProject = await new Projects(req.body).save()
   if (!newProject) {
      throw new ErrorMessage(404, 'No Projects Added Check Your Data 🙄')
   }
   res.status(201).json(newProject)
})

export const updateProject = catchError(async (req, res) => {
   if (req.files) {
      Object.keys(req.files).forEach((file) => {
         const [image] = req.files[file]
         req.body[file] = image.dest
      })
   }
   const project = await Projects.findById(req.params.projectId)

   if (req.body.projectCategory) {
      const projectCategory = await ProjectsCategories.findOne({
         _id: req.body.projectCategory,
      })
      if (!projectCategory) {
         throw new ErrorMessage(404, 'No such project category id exists')
      }
   }
   if (req.files.previewImages) {
      const prevImages = req.files.previewImages.map(
         (image) => image.dest
      )
      const deletedPreviewImages = req?.body?.deletedPreviewImages ? JSON.parse(req.body.deletedPreviewImages) : [];

      const deletedPreviewImagesLength = deletedPreviewImages.length;
      const previewImagesLength = prevImages ? prevImages.length : 0;

      if (deletedPreviewImagesLength > 3 || deletedPreviewImagesLength < 1) {
          throw new ErrorMessage(400, 'The deletedPreviewImages must be between 1 and 3 images');
      }
      
      if (deletedPreviewImagesLength !== previewImagesLength) {
          throw new ErrorMessage(400, `The replacement images must be exactly ${deletedPreviewImagesLength} image(s)`);
      }

      req.body.previewImages = project.previewImages.filter(
         (image) => !deletedPreviewImages.includes(image)
      )

      req.body.previewImages.push(...prevImages)

      if (req.body.previewImages.length !== 3) {
         throw new ErrorMessage(400, 'Please the preview images must be 3 images')
      }

   } else if (
      req.body?.deletedPreviewImages &&
      req.body?.deletedPreviewImages?.length > 0
   ) {
      throw new ErrorMessage(400, 'The Preview Images are required to be 3 images')
   }
   const updatedProject = await Projects.findByIdAndUpdate(
      { _id: req.params.projectId },
      req.body,
      { new: true }
   )
   if (!updatedProject) {
      throw new ErrorMessage(404, "Project id doesn't exist ")
   }
   res.status(201).json({
      message: 'project update successfully',
      updatedProject,
   })
})

export const deleteProject = catchError(async (req, res) => {
   const deletedProject = await Projects.deleteOne({
      _id: req.params.projectId,
   })
   if (deletedProject.deletedCount === 0) {
      throw new ErrorMessage(404, "category id doesn't exist ")
   }

   res.status(201).json({ message: 'Project is deleted successfully..!' })
})
