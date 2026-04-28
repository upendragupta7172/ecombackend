
import  nodemailer from 'nodemailer'
import 'dotenv/config'

// export const verifyemail = (token , email)=>{


// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user:process.env.MAIL_USER,
//         pass: process.env.MAIL_PASS
//     }
// });

// // const token = jwt.sign({
// //         data: 'Token Data'  .
// //     }, 'ourSecretKey', { expiresIn: '10m' }  
// // );    

// const mailConfigurations = {

//     // It should be a string of sender/server email
//     from: process.env.MAIL_USER,

//     to: 'email',

//     // Subject of Email
//     subject: 'Email Verification',
    
//     // This would be the text of email body
//     text: `Hi! There, You have recently visited 
//            our website and entered your email.
//            Please follow the given link to verify your email
//            http://localhost:5173/verify/${token} 
//            Thanks`
// };

// transporter.sendMail(mailConfigurations, function(error, info){
//     if (error) throw Error(error);
//     console.log('Email Sent Successfully');
//     console.log(info);
// });

    




// }








export const verifyemail = (token, email) => {
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
    subject: 'Email Verification',
    text: `Hi! Please verify your email: http://localhost:5173/varify/${token}`
  };

  transporter.sendMail(mailConfigurations, function (error, info) {
    if (error) {
      console.log("Email Error:", error); // Server crash nahi hoga
    } else {
      console.log('Email Sent Successfully');
    }
  });
};