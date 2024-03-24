import platform from 'platform'
import ipaddr from 'ipaddr.js'
import geoip from 'geoip-lite'
import countryFromCode from '../utils/countryCodes/country.js'
import { customAlphabet } from 'nanoid'

const randomString = customAlphabet('1234kg5678GLCOWlnbxaqyjertyuinsazaP9', 32)

export default (req, res, next) => {
   const userAgent = platform.parse(req.headers['user-agent'])?.toString()
   const deviceID = req.headers['x-device-id'] || randomString()
   let ip
   try {
      ip = ipaddr.parse(req.ip).toIPv4Address().toString()
   } catch (error) {
      ip = ipaddr.parse(req.ip).toNormalizedString()
   }
   req.clientIp = ip
   req.userAgent = userAgent
   const geo = geoip.lookup(ip)
   req.clientGeo = `${countryFromCode(geo?.country) || 'N/A'}, ${geo?.city || 'N/A'}, timezone: ${geo?.timezone || 'N/A'}`

   req.device = {
      agent: userAgent,
      ip: ip,
      geo: req.clientGeo,
      country: countryFromCode(geo?.country) || geo?.country || null,
      id: deviceID,
   }

   console.log(req.device)

   next()
}
