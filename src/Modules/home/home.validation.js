import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const updateHome = joi.object({
   getStarted: joi.object({
      title: joi.string().min(2),
      description: joi.string().min(2),
      image: joi.string().min(2),
   }),
   'getStarted.title': joi.string().min(2),
   'getStarted.description': joi.string().min(2),
   'getStarted.image': joi.string().min(2),
   aboutUs: joi.object({
      title: joi.string().min(2),
      description: joi.string().min(2),
      image: joi.string().min(2),
   }),
   'aboutUs.title': joi.string().min(2),
   'aboutUs.description': joi.string().min(2),
   'aboutUs.image': joi.string().min(2),
   clients: joi.array().items(joi.string()),
   portfolio: joi.object({
      title: joi.string().min(2),
      description: joi.string().min(2),
   }),
   reviewsTitle: joi.string().min(2),
   whyChooseUs: joi.object({
      title: joi.string().min(2),
      image: joi.string().min(2),
      reasons: joi.object({
         first: joi.object({
            title: joi.string().min(2),
            description: joi.string().min(2),
            img: joi.string().min(2),
         }),
         second: joi.object({
            title: joi.string().min(2),
            description: joi.string().min(2),
            img: joi.string().min(2),
         }),
         third: joi.object({
            title: joi.string().min(2),
            description: joi.string().min(2),
            img: joi.string().min(2),
         }),
         fourth: joi.object({
            title: joi.string().min(2),
            description: joi.string().min(2),
            img: joi.string().min(2),
         }),
      }),
   }),
   contact: joi.object({
      bigTitle: joi.string().min(2),
      smallTitle: joi.string().min(2),
      description: joi.string().min(2),
      phone: joi.string().min(2),
      mail: joi.string().min(2),
      location: joi.string().min(2),
      facebook: joi.string().min(2),
      insta: joi.string().min(2),
      discord: joi.string().min(2),
      linkedin: joi.string().min(2),
   }),
   frequentlyAskedQuestions: joi.array().items(
      joi.object({
         question: joi.string().min(2),
         answer: joi.string().min(2),
      })
   ),
})

export const addService = joi
   .object({
      serviceId: generalFields.id.required(),
   })
   .required()
export const deleteService = joi
   .object({
      serviceId: generalFields.id.required(),
   })
   .required()
export const addProject = joi
   .object({
      projectId: generalFields.id.required(),
   })
   .required()
export const deleteProject = joi
   .object({
      projectId: generalFields.id.required(),
   })
   .required()

export const addClient = joi
   .object({
      clientImage: generalFields.file.required(),
   })
   .required()
export const deleteClient = joi
   .object({
      imageName: joi.string().required(),
   })
   .required()

export const updateHeader = joi
   .object({
      title: joi.string(),
      description: joi.string(),
      image: generalFields.file,
      videoUrl: joi.string(),
   })
   .required()

export const updateAboutUs = joi
   .object({
      title: joi.string(),
      description: joi.string(),
      image: generalFields.file,
   })
   .required()

export const updateContact = joi
   .object({
      bigTitle: joi.string().min(2),
      smallTitle: joi.string().min(2),
      description: joi.string().min(2),
      phone: joi.string().min(2),
      mail: joi.string().min(2),
      location: joi.string().min(2),
      facebook: joi.string().min(2),
      insta: joi.string().min(2),
      discord: joi.string().min(2),
      linkedin: joi.string().min(2),
   })
   .required()

export const updateWhyChooseUs = joi
   .object({
      title: joi.string().min(2).required(),
      image: joi.string().min(2).required(),
      first: joi.object({
         title: joi.string().min(2),
         description: joi.string().min(2),
         image: joi.string().min(2),
      }),
      second: joi.object({
         title: joi.string().min(2),
         description: joi.string().min(2),
         image: joi.string().min(2),
      }),
      third: joi.object({
         title: joi.string().min(2),
         description: joi.string().min(2),
         image: joi.string().min(2),
      }),
      fourth: joi.object({
         title: joi.string().min(2),
         description: joi.string().min(2),
         image: joi.string().min(2),
      }),
   })
   .required()

export const addFAQ = joi
   .object({
      question: joi.string().min(2).required(),
      answer: joi.string().min(2).required(),
   })
   .required()

export const updateFAQ = joi
   .object({
      id: generalFields.id.required(),
      question: joi.string().min(2),
      answer: joi.string().min(2),
   })
   .required()

export const deleteFAQ = joi
   .object({
      id: generalFields.id.required(),
   })
   .required()

/*{
    "getStarted": {
    "title": "",
    "description":"",
    "image": ""
  },
  "aboutUs": {
    "title": "",
    "description": "",
    "image": ""
  },
  "ourServicesTitle":"",
  "ourServices":[],
  latestProjectsTitle: "Our Latest Projects",
  latestProjects: [],
  "clients": [],
  "portfolio": {
    "title":"",
    "description":""
  },
  "reviewsTitle": "hjkljkljikl",
  "whyChooseUs": {
    "title": "",
    "image": "",
    "reasons": {
      "first":{
        "title": "",
        "description": "",
        "img": ""
      },
      "second": {
        "title": "",
        "description": "",
        "img": ""
      },
      "third": {
        "title": "",
        "description": "",
        "img": ""
      },
      "fourth": {
        "title":"",
        "description":"",
        "img": ""
      }
    }
  },
  "contact":{
    "bigTitle":"",
    "smallTitle": "",
    "description":"",
    "phone": "",
    "mail": "",
    "location": "",
    "facebook":"",
    "insta":"",
    "discord":"",
    "linkedin": ""
  }
}*/
/*{
    "getStarted": {
    "title": "111",
    "description":"111",
    "image": "111"
  },
  "aboutUs": {
    "title": "111",
    "description": "111",
    "image": "111"
  },
  "ourServicesTitle":"Our Services",
  "ourServices":[11,22],
  latestProjectsTitle: "Our Latest Projects",
  latestProjects: [],
  "clients": ["111"],
  "portfolio": {
    "title":"111",
    "description":"111"
  },
  "reviewsTitle": "111",
  "whyChooseUs": {
    "title": "111",
    "image": "111",
    "reasons": {
      "first":{
        "title": "111",
        "description": "111",
        "image": "111"
      },
      "second": {
        "title": "111",
        "description": "111",
        "image": "111"
      },
      "third": {
        "title": "111",
        "description": "111",
        "image": "111"
      },
      "fourth": {
        "title":"111",
        "description":"111",
        "image": "111"
      }
    }
  },
  "contact":{
    "bigTitle":"111",
    "smallTitle": "111",
    "description":"111",
    "phone": "111",
    "mail": "111",
    "location": "111",
    "facebook":"111",
    "insta":"111",
    "discord":"111",
    "linkedin": "111"
  }
}*/
