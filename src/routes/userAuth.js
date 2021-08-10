const express = require("express");
const router = new express.Router();
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const User = require("../models/user");

// <-------------Register----------------->

router.post("/api/register", async (req, res) => {
    console.log("recieved a post request for register");
    const { username, email, password: plainTextPassword } = req.body;

    // Hasing the passwords - we use bcrypt algorithm
    const password = await bcrypt.hash(plainTextPassword, 10);

    // Creating the user in the database
    try {
        await User.create({
            username,
            password,
            email,
        });
    } catch (error) {
        if (error.code === 11000 && error.errmsg.includes("email")) {
            return res.json({ 
                status: "error", 
                msg: "email already exists" 
            });
        } else if (error.code === 11000 && error.errmsg.includes("username")) {
            return res.json({
                status: "error",
                msg: "Username already exists"
            });
        }
        throw error;
    }
    return res.json({
        status: "ok",
        msg: "User registered Successfully"
    })
});
// =============== Register ================================



// ============== log-in ====================================

router.post('/api/login', async(req,res)=>{
    console.log('recieved a post request for login')
    const {username, password} = req.body
    const user = await User.findOne({username}).lean()
    if(!user){
        return res.json({
            status: 'error',
            msg: "User Not Found"
        })
    }

    if(!await bcrypt.compare(password, user.password)){
        return res.json({
            status: 'error',
            msg: "Invalid username or password"
        })
    }
    
    try{
        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '15d'})

        await User.findOneAndUpdate({username}, {
            $push: {
                tokens: [{
                    token: token
                }]
            }
        })
        return res.json({
            status: 'ok',
            msg: "Logged in Successfully",
            token: token
        })

    } catch (error){
        return res.json({
            status: 'error',
            msg: 'something went wrong'
        })
    }

})

// ============== log-in ====================================

module.exports = router;
