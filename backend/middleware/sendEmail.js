const nodemailer = require("nodemailer");

exports.sendEmail = async (options) => {
    var transporter = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "2b9be61b9c819a",
              pass: "1877c5b4c79822"
            }
    });

    const mailOptions = {
        from:"",
        to: options.email,
        subject: options.subject,
        text: options.message,
    }

    await transporter.sendMail(mailOptions);
}