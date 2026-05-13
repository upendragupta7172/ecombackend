import sendEmail from "../utils/sendEmail.js";

export const verifyemail = async (token, email) => {
  const baseUrl =
    process.env.FRONTEND_URL?.trim() ||
    "https://ecom-git-main-upendra-guptas-projects.vercel.app";
  const verificationUrl = `${baseUrl}/varify/${token}`;

  return sendEmail(
    email,
    "Account Verification - Upendra Store",
    `Welcome to Upendra Store! Verify your email here: ${verificationUrl}`,
    `
      <h2>Welcome to our store!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email Address</a>
    `,
    { fromName: "Upendra Store" }
  );
};
