import isValidDomain from 'is-valid-domain'
import { isUri } from 'valid-url'
import pkg from 'validator'
import listOfTLDs from './TLDs.js'

const { isURL } = pkg

const checkIfValidTLD = (tld) => {
   // binary search to check if tld is in listOfTLDs
   let left = 0
   let right = listOfTLDs.length - 1
   while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      if (listOfTLDs[mid] === tld) {
         return true
      }
      if (listOfTLDs[mid] < tld) {
         left = mid + 1
      } else {
         right = mid - 1
      }
   }
   return false
}

function removePunctuation(str) {
   const cleanedString = str.replace(
      /^[.,;:(){}[\]/?'"`~!@#$%^&*\-_=+|]+|[.,;:(){}[\]/?'"`~!@#$%^&*\-_=+|]+$/g,
      ''
   )
   return cleanedString
}

const cleanUpString = (inputString) => {
   const cleanedString = inputString?.trim() || ''

   const newString = removePunctuation(cleanedString)

   return newString
}

const extractURLs = (inputString) => {
   const words = inputString?.split(' ') || []

   let links = words?.filter((word) => {
      const link = cleanUpString(word)
      if (isURL(link) || isUri(link) || isValidDomain(link)) {
         if (!link?.startsWith('http') && !link?.startsWith('http')) {
            const tld = link?.split('.')?.at(-1) || ''
            return checkIfValidTLD(tld)
         }
         return true
      }
      return false
   })

   links = links?.map((link) => cleanUpString(link)) || []

   return links
}

export default extractURLs
