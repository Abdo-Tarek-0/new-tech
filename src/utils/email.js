import nodemailer from 'nodemailer'

async function sendEmail({
   to,
   cc,
   bcc,
   subject,
   html,
   attachments = [],
} = {}) {
   const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
         user: process.env.gmail, // generated ethereal user
         pass: process.env.gmailPass, // generated ethereal password
      },
   })

   // send mail with defined transport object
   const info = await transporter.sendMail({
      from: `"Route Academy" <${process.env.gmail}>`, // sender address
      to,
      cc,
      bcc,
      subject,
      html,
      attachments,
   })

   return !info.rejected.length
}

export default sendEmail

// const getHtml = ({ link, refreshLink }) => {
//   return `<!DOCTYPE html>
//     <html>
//     <head>
//         <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
//     <style type="text/css">
//     body{background-color: #88BDBF;margin: 0px;}
//     </style>
//     <body style="margin:0px;">
//     <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
//     <tr>
//     <td>
//     <table border="0" width="100%">
//     <tr>
//     <td>
//     <h1>
//         <img width="100px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png"/>
//     </h1>
//     </td>
//     <td>
//     <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration: none;">View In Website</a></p>
//     </td>
//     </tr>
//     </table>
//     </td>
//     </tr>
//     <tr>
//     <td>
//     <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
//     <tr>
//     <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
//     <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
//     </td>
//     </tr>
//     <tr>
//     <td>
//     <h1 style="padding-top:25px; margin:0; color:#630E2B">Email Confirmation</h1>
//     </td>
//     </tr>
//     <tr>
//     <td>
//     <p style="padding:0px 100px;">
//     </p>
//     </td>
//     </tr>
//     <tr>
//     <td>
//     <a href="${link}" style="margin:2px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Verify Email address </br></a>
//     </td>
//     </tr>
//     <tr>
//     <td>
//     <a href="${refreshLink}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">resend verification Email </a>
//     </td>
//     </tr>
//     </table>
//     </td>
//     </tr>
//     <tr>
//     <td>
//     <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
//     <tr>
//     <td>
//     <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
//     </td>
//     </tr>
//     <tr>
//     <td>
//     <div style="margin-top:20px;">

//     <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
//     <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>

//     <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
//     <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
//     </a>

//     <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
//     <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
//     </a>

//     </div>
//     </td>
//     </tr>
//     </table>
//     </td>
//     </tr>
//     </table>
//     </body>
//     </html>`;
// };

// const getSendCodeHtml = ({ code }) => {
//   return `<!DOCTYPE html>
//     <html>
//     <head>
//         <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
//     <style type="text/css">
//     body{background-color: #88BDBF;margin: 0px;}
//     </style>
//     <body style="margin:0px;">
//     <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
//     <tr>
//     <td>
//     <table border="0" width="100%">
//     <tr>
//     <td>
//     <h1>
//         <img width="100px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png"/>
//     </h1>
//     </td>
//     <td>
//     <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration: none;">View In Website</a></p>
//     </td>
//     </tr>
//     </table>
//     </td>
//     </tr>
//     <tr>
//     <td>
//     <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
//     <tr>
//     <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
//     <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
//     </td>
//     </tr>
//     <tr>
//     <td>
//     <h1 style="padding-top:25px; color:#630E2B">Verification Code</h1>
//     </td>
//     </tr>
//     <tr>
//     <td>
//     <p style="padding:0px 100px;">
//     </p>
//     </td>
//     </tr>
//     <tr>
//     <td>
//     <p  style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">${code} <br></p>
//     </td>
//     </tr>

//     </table>
//     </td>
//     </tr>
//     <tr>
//     <td>
//     <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
//     <tr>
//     <td>
//     <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
//     </td>
//     </tr>
//     <tr>
//     <td>
//     <div style="margin-top:20px;">

//     <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
//     <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>

//     <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
//     <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
//     </a>

//     <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
//     <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
//     </a>

//     </div>
//     </td>
//     </tr>
//     </table>
//     </td>
//     </tr>
//     </table>
//     </body>
//     </html>`;
// };

const getStyleHtml = ({ link, refreshLink }) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Account Activation</title>
    <style>
      /* Add your email styles here */
      body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 16px;
        line-height: 1.5;
        color: #333333;
        padding: 0;
        margin: 0;
      }

      h1 {
        font-size: 24px;
        margin-top: 0;
      }

      p {
        margin-top: 0;
        margin-bottom: 1em;
      }

      a {
        color: #FFFFFF;
        background-color: #007BFF;
        border-radius: 4px;
        display: inline-block;
        font-size: 16px;
        font-weight: bold;
        line-height: 1.5;
        padding: 10px 20px;
        text-align: center;
        text-decoration: none;
        transition: background-color 0.3s ease;
      }

      a:hover {
        background-color: #0069D9;
      }
    </style>
  </head>

  <body>
    <div style="max-width: 600px; margin: 0 auto;">
      <h1 style="color: #007BFF;">Account Activation</h1>

      <p>Dear Reciever</p>

      <p>Thank you for signing up for an account on e-shop! We're excited to have you as a new member of our community.</p>

      <p>To complete your registration and activate your account, please click the following link:</p>

      <p><a href="${link}">Activate Your Account</a></p>

      <p>This link will expire in 5 minutes, so please make sure to activate your account as soon as possible.</p>

      <p>If you did not register for an account on e-shop, please disregard this email.</p>

      

      <p>If The Link Expired You Can Ask To Resend New Email</p>
      <p><a href="${refreshLink}">Resend New Mail</a></p>
      <p>Thank you for choosing e-shop!</p>
      <p>Best regards,<br />e-shop Team</p>
    </div>
  </body>
</html>`

const getSendCodeHtml = ({ code }) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Account Activation</title>
    <style>
      /* Add your email styles here */
      body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 16px;
        line-height: 1.5;
        color: #333333;
        padding: 0;
        margin: 0;
      }

      h1 {
        font-size: 24px;
        margin-top: 0;
      }

      p {
        margin-top: 0;
        margin-bottom: 1em;
      }

      a {
        color: #FFFFFF;
        background-color: #007BFF;
        border-radius: 4px;
        display: inline-block;
        font-size: 16px;
        font-weight: bold;
        line-height: 1.5;
        padding: 10px 20px;
        text-align: center;
        text-decoration: none;
        transition: background-color 0.3s ease;
      }

      a:hover {
        background-color: #0069D9;
      }
    </style>
  </head>

  <body>
    <div style="max-width: 600px; margin: 0 auto;">
      <h1 style="color: #007BFF;">Verification Code</h1>

      <p>Dear Reciever</p>

      <p>Thank you for signing up for an account on e-shop! We're excited to have you as a new member of our community.</p>

      <p>Your Verification Code</p>

      <h1 style=" text-align:center;color: #fff;background-color:#007BFF">${code}</h1>     
      <p>Thank you for choosing e-shop!</p>
      <p>Best regards </p>
      <p>e-shop </p>
    </div>
  </body>
</html>`
export { getSendCodeHtml, getStyleHtml }
