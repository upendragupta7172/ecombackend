import nodemailer from "nodemailer";

const getMailCredentials = () => {
  const user = process.env.MAIL_USER?.trim();
  const rawPass = process.env.MAIL_PASS?.trim();
  const pass = rawPass?.includes(" ") ? rawPass.replace(/\s+/g, "") : rawPass;

  if (!user || !pass) {
    const error = new Error(
      "MAIL_USER and MAIL_PASS must be set before sending email."
    );
    error.isEmailError = true;
    throw error;
  }

  return { user, pass };
};

const createTransporter = () => {
  const { user, pass } = getMailCredentials();
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT?.trim() || 465);
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE.trim().toLowerCase() === "true"
    : port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
};

const normalizeEmailError = (error) => {
  if (error?.code === "EAUTH") {
    const authError = new Error(
      "Gmail SMTP login failed. Set MAIL_USER to your Gmail address and MAIL_PASS to a valid 16-character Google App Password."
    );
    authError.code = error.code;
    authError.responseCode = error.responseCode;
    authError.cause = error;
    authError.isEmailError = true;
    return authError;
  }

  error.isEmailError = true;
  return error;
};

const sendEmail = async (to, subject, text, html, options = {}) => {
  const { user } = getMailCredentials();
  const transporter = createTransporter();
  const from = options.from || (options.fromName ? `"${options.fromName}" <${user}>` : user);

  const mailOptions = {
    from,
    to,
    subject,
  };

  if (text) {
    mailOptions.text = text;
  }

  if (html) {
    mailOptions.html = html;
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
    return info;
  } catch (error) {
    console.error("Email send failed:", error);
    throw normalizeEmailError(error);
  }
};

export default sendEmail;
