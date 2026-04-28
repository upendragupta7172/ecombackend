import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,   // 👈 tera existing .env use ho raha hai
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("📩 Email Sent:", info.response);

    return true;

  } catch (error) {
    console.log("❌ Email Error:", error.message);
    return false;
  }
};

export default sendEmail;