const nodemailer = require('nodemailer');
console.log(process.env.ENV)

const sendmail = async (msg) => {
    if(process.env.ENV === 'development'){
        console.log("mail in development")
        let testAccount = await nodemailer.createTestAccount();
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, 
            auth: {
            user: testAccount.user, 
            pass: testAccount.pass, 
            },
        });
        let info = await transporter.sendMail(msg)
        console.log("message sent: ", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } else if(process.env.ENV === 'production'){
        console.log('mail in production')
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        })
        transporter.sendMail(msg, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
        });
    }
}

module.exports = sendmail

