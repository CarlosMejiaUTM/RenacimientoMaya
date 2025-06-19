const nodemailer = require('nodemailer');
const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST, port: process.env.EMAIL_PORT, secure: false, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    await transporter.sendMail({
        from: `Zonas Turísticas Yucatán <${process.env.EMAIL_USER}>`, to: options.email, subject: options.subject, html: options.html
    });
};
module.exports = sendEmail;