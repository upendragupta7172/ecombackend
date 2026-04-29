
// import  nodemailer from 'nodemailer'
// import 'dotenv/config'









// export const verifyemail = (token, email) => {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.MAIL_USER,
//       pass: process.env.MAIL_PASS
//     }
//   });

//   const mailConfigurations = {
//     from: process.env.MAIL_USER,
//     to: email, // FIX: Quotes hatayein, variable use karein
//     subject: 'Email Verification',
//     text: `Hi! Please verify your email: http://localhost:5173/varify/${token}`
//   };

//   transporter.sendMail(mailConfigurations, function (error, info) {
//     if (error) {
//       console.log("Email Error:", error); // Server crash nahi hoga
//     } else {
//       console.log('Email Sent Successfully');
//     }
//   });
// };




import nodemailer from 'nodemailer';
import 'dotenv/config';

export const verifyemail = async (token, email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const mailConfigurations = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Email Verification',
      text: `Hi! Please verify your email: https://ecom-git-main-upendra-guptas-projects.vercel.app/varify/${token}`
    };

    const info = await transporter.sendMail(mailConfigurations);
    console.log("Email sent:", info.response);

  } catch (error) {
    console.log("Email Error:", error.message);
  }
};