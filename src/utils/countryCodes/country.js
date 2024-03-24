import CODES from './countryCodes.js'

function capitalizeEachWord(str) {
   if (typeof str !== 'string') {
      return null
   }

   const words = str.split(' ')
   for (let i = 0; i < words.length; i += 1) {
      words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1)
   }
   return words.join(' ')
}

const countryFromCode = (code) => {
   code = code?.toUpperCase()?.trim() || ''
   return capitalizeEachWord(CODES[code]?.toLowerCase()?.trim()) || null
}

export default countryFromCode
