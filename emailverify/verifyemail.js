
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
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER, // e.g. "yourname@gmail.com"
        pass: process.env.MAIL_PASS  // ⚠️ Use 16-digit APP PASSWORD, not regular password
      }
    });

    const mailConfigurations = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Account Verification - Upendra Store',
      html: `
        <h2>Welcome to our store!</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="https://ecom-git-main-upendra-guptas-projects.vercel.app/varify/${token}">Verify Email Address</a>
      `
    };

    const info = await transporter.sendMail(mailConfigurations);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("❌ Nodemailer Error:", error);
  }
};