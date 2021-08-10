const sendmail = require('./sendmail');
const User = require('../models/user')
const crypto = require('crypto');


const emailVerification = async(req, res) => {
    const {email} = req.body

    const user = await User.findOne({email})
    if(!user){
        return res.json({
            status: "error", 
            msg: "No user with this email"
        })
    }
    const id = user._id
    let token = crypto.randomBytes(64).toString('hex');
    user.emailToken = token
    await user.save();
    
    try{
        const msg = {
            from: `Banao <${process.env.EMAIL_USERNAME}>`,
            to: email,
            subject: 'Reset password link',
            text: `
            hello, your request for reactivation is confirmed
            please click on the link to reset your passwrod
            ${process.env.URI}/api/forgot-password/${token}
            `,
            html: `
            hello, your request for reactivation is confirmed
            please click on the link to reset your passwrod
            <a href="${process.env.URI}/api/forgot-password/${token}"> reset password </a>
            ` 
        };
        sendmail(msg)
        
        return res.json({
            status: 'ok', 
            msg: 'check your email for further information'
        })
        
    } catch(error){
        return res.json({
            status: 'error', 
            msg: 'Some thing went wrong, contact us for assistance'
        })
    }
}


module.exports = emailVerification