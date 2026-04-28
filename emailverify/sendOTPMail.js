
 import  nodemailer from 'nodemailer'
 import 'dotenv/config'

export const sendOTPMail = (otp, email) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

    const mailConfigurations = {
     from: process.env.MAIL_USER,
     to: email, // FIX: Quotes hatayein, variable use karein
     subject: 'PASSWORD RESET OTP ',
     html:`<h1>your reset otp is :</h1> ${otp}`
  };

  transporter.sendMail(mailConfigurations, function (error, info) {
    if (error) {
      console.log("Email Error:", error); // Server crash nahi hoga
    } else {
      console.log('OTP Sent Successfully');
    }
  });
};