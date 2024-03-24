import speakeasy from 'speakeasy';
import qrcode from 'qrcode';


export default class TwoFactorAuthServices {
    static async generateTwoFactorAuth(label) {
       const secret = speakeasy.generateSecret({
          name: 'Tech Logit',
       })
       const otpauthUrl = speakeasy.otpauthURL({
          secret: secret.ascii,
          label: label,
          issuer: 'Tech Logit',
       })
       const QRCode = await qrcode.toDataURL(otpauthUrl)
 
       return {
          secret: secret.ascii,
          QRCode,
       }
    }
 
    static verifyTwoFactorAuth(token, secret) {
       return speakeasy.totp.verify({
          secret: secret,
          encoding: 'ascii',
          token: token,
          window: 3,
       })
    }
 }