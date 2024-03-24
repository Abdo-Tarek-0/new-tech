import mongoose, { Types, Schema } from 'mongoose'

const getStartedSchema = new mongoose.Schema(
   {
      title: {
         type: String,
         trim: true,
         minLength: [1, 'too short  title'],
         default:
            'Transform your ideas into reality with our full-service Design to Development team.',
      },
      description: {
         type: String,
         trim: true,
         minLength: [1, 'too short  description'],
         default:
            'Odio venenatis a, non egestas ut ultrices ultrices quis orci ipsum eu tellus tempor sed amet mauris pellentesque ut vitae lorep ipsum.',
      },
      image: {
         type: String,
         trim: true,
         default: 'uploads/home/Ellipse-833.png',
      },
      videoUrl: {
         type: String,
         trim: true,
         default: 'https://www.youtube.com/watch?v=rqjO5Z9Lt_M',
      },
   },
   { _id: false }
)
const aboutUsSchema = new mongoose.Schema(
   {
      title: {
         type: String,
         trim: true,
         minLength: [1, 'too short  title'],
         default: 'About Us',
      },
      description: {
         type: String,
         trim: true,
         minLength: [1, 'too short  description'],
         default:
            'We move with make a Creative Strategy for help your business goal, we help to improve your income by a services we have. make your content look interesting and make people look for your business. we move with make a creative strategy for help your business goal.',
      },
      image: {
         type: String,
         default: 'uploads/home/2023-08-31 124001.png',
      },
   },
   { _id: false }
)
// const projectsSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       trim: true,
//       required: [true, "title is required"],
//       minLength: [1, "too short  title"],
//     },
//     description: {
//       type: String,
//       trim: true,
//       required: [true, "description is required"],
//       minLength: [1, "too short  description"],
//     },
//     image: {
//       type: String,
//       trim: true,
//       required: [true, "description is required"],
//     },
//     category: {
//       type: String,
//       trim: true,
//       required: [true, "description is required"],
//     },
//   },
//   { _id: false }
// );

const portfolioSchema = new mongoose.Schema(
   {
      title: {
         type: String,
         default: 'Our Portfolio',
      },
      description: {
         type: String,
         default:
            "We are focused on helping brand grow through digital transformation services. we bring real solutions to each clients' problem through a deep understanding of their market, solution, and vision.",
      },
   },
   { _id: false }
)
const whyChooseUsSchema = new mongoose.Schema(
   {
      title: {
         type: String,
         trim: true,
         minLength: [1, 'too short  title'],
      },
      image: {
         type: String,
      },
      reasons: {
         first: {
            title: {
               type: String,
            },
            description: {
               type: String,
            },
            image: {
               type: String,
            },
         },
         second: {
            title: {
               type: String,
            },
            description: {
               type: String,
            },
            image: {
               type: String,
            },
         },
         third: {
            title: {
               type: String,
            },
            description: {
               type: String,
            },
            image: {
               type: String,
            },
         },
         fourth: {
            title: {
               type: String,
            },
            description: {
               type: String,
            },
            image: {
               type: String,
            },
         },
      },
   },
   { _id: false }
)
const contactSchema = new mongoose.Schema(
   {
      bigTitle: {
         type: String,
         trim: true,
         minLength: [1, 'too short  title'],
         default: 'Get in Touch',
      },
      smallTitle: {
         type: String,
         trim: true,
         minLength: [1, 'too short  title'],
         default: 'Contact Information',
      },
      description: {
         type: String,
         trim: true,
         minLength: [1, 'too short  description'],
         default:
            'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      },
      phone: {
         type: String,
         default: '+1012 3456 789',
      },
      mail: {
         type: String,
         default: 'demo@gmail.com',
      },
      location: {
         type: String,
         default:
            '132 Dartmouth Street Boston, Massachusetts 02156 United States',
      },
      facebook: {
         type: String,
         default: '',
      },
      insta: {
         type: String,
         default: '',
      },
      discord: {
         type: String,
         default: '',
      },
      linkedin: {
         type: String,
         default: '',
      },
   },
   { _id: false }
)

const frequentlyAskedQuestion = new mongoose.Schema(
   {
      question: {
         type: String,
         required: [true, 'question is required'],
      },
      answer: {
         type: String,
         required: [true, 'answer is required'],
      },
   },
   { _id: true }
)

const homeSchema = new Schema(
   {
      getStarted: getStartedSchema,

      ourServicesTitle: {
         type: String,
         default: 'Our Services',
      },
      ourServices: [
         {
            type: Types.ObjectId,
            ref: 'Categories',
         },
      ],
      latestProjectsTitle: {
         type: String,
         default: 'Our Latest Projects',
      },
      latestProjects: [
         {
            type: Types.ObjectId,
            ref: 'Projects',
         },
      ],
      aboutUs: aboutUsSchema,
      clients: [String],
      portfolio: portfolioSchema,
      reviewsTitle: {
         type: String,
         default: 'What Our Customer Says',
      },
      whyChooseUs: whyChooseUsSchema,
      contact: contactSchema,
      frequentlyAskedQuestions: [frequentlyAskedQuestion],
      // projects: [projectsSchema],
   },
   { timestamps: true }
)
const HomeModel =
   mongoose.models.Home || mongoose.model('Home', homeSchema, 'home')
export default HomeModel

const createHomeInstance = async () => {
   try {
      const homeDetails = await HomeModel.findOne()
      if (!homeDetails) {
         await new HomeModel({
            getStarted: {},
            ourServicesTitle: 'Our Services',
            ourServices: [],
            latestProjectsTitle: 'Our Latest Projects',
            latestProjects: [],
            aboutUs: {},
            clients: [],
            portfolio: {},
            reviewsTitle: 'What Our Customer Says',
            whyChooseUs: {},
            contact: {},
            frequentlyAskedQuestions: [],
         }).save()

         console.log('home created')
      }
      console.log('home already created')
   } catch (error) {
      console.log(error)
   }
}
createHomeInstance()
