
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
  const user = process.env.MAIL_USER?.trim();
  const pass = process.env.MAIL_PASS?.trim();

  console.log("Attempting to send email to:", email);
  if (!user || !pass) {
    console.error("❌ MAIL_USER or MAIL_PASS is missing in environment variables!");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: user,
        pass: pass
      }
    });

    // Check if connection is successful
    await transporter.verify().then(() => {
      console.log("Connected to Gmail SMTP server");
    }).catch((err) => {
      console.error("SMTP Connection Error:", err);
    });

    const mailOptions = {
      from: `"Upendra Store" <${user}>`,
      to: email,
      subject: 'Account Verification - Upendra Store',
      html: `
        <h2>Welcome to our store!</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="https://ecom-git-main-upendra-guptas-projects.vercel.app/varify/${token}">Verify Email Address</a>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response);
  } catch (error) {
    console.error("❌ Nodemailer Error details:");
    console.error(error);
  }
};