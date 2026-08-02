const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"TradeX" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email send error:', error.message);
    throw new Error('Failed to send email');
  }
};

const sendLicenseEmail = async (user, license, product) => {
  const html = `
    <h1>Your TradeX License Key</h1>
    <p>Dear ${user.name},</p>
    <p>Thank you for purchasing <strong>${product.name}</strong>.</p>
    <p>Your license key: <strong>${license.key}</strong></p>
    <p>Expires: ${new Date(license.expiryDate).toLocaleDateString()}</p>
    <p>You can activate this key in your dashboard.</p>
    <br/>
    <p>TradeX Team</p>
  `;
  await sendEmail(user.email, 'Your TradeX License Key', html);
};

module.exports = { sendEmail, sendLicenseEmail };