const nodemailer = require('nodemailer');

/**
 * Creates a transporter object using SMTP.
 * Configure with your email service credentials.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g., smtp.gmail.com
  port: process.env.SMTP_PORT, // e.g., 587
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // Your email
    pass: process.env.SMTP_PASS, // Your email password or app-specific password
  },
});

/**
 * Sends a verification email to the user.
 * @param {string} to - Recipient's email address
 * @param {string} token - Verification token
 */
async function sendVerificationEmail(to, token) {
  const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM, // Sender address
    to,
    subject: 'Verify Your Email',
    text: `Please verify your email by clicking the following link: ${verificationLink}`,
    html: `<p>Please verify your email by clicking the following link:</p><a href="${verificationLink}">Verify Email</a>`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendVerificationEmail,
}; 