import sendEmail from "../utils/sendEmail.js";

export const sendOTPMail = async (otp, email) => {
  return sendEmail(
    email,
    "Password Reset OTP",
    `Your password reset OTP is: ${otp}`,
    `<h1>Your reset OTP is:</h1><p>${otp}</p>`,
    { fromName: "Upendra Store" }
  );
};
