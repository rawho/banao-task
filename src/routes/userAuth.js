const express = require("express");
const router = new express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const emailVerification = require("../utils/emailVerification");

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
                msg: "email already exists",
            });
        } else if (error.code === 11000 && error.errmsg.includes("username")) {
            return res.json({
                status: "error",
                msg: "Username already exists",
            });
        }
        throw error;
    }
    return res.json({
        status: "ok",
        msg: "User registered Successfully",
    });
});
// =============== Register ================================

// ============== log-in ====================================

router.post("/api/login", async (req, res) => {
    console.log("recieved a post request for login");
    const { username, password } = req.body;
    const user = await User.findOne({ username }).lean();
    if (!user) {
        return res.json({
            status: "error",
            msg: "User Not Found",
        });
    }

    if (!(await bcrypt.compare(password, user.password))) {
        return res.json({
            status: "error",
            msg: "Invalid username or password",
        });
    }

    try {
        const token = jwt.sign(
            {
                id: user._id,
                username: user.username,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: "15d" }
        );

        await User.findOneAndUpdate(
            { username },
            {
                $push: {
                    tokens: [
                        {
                            token: token,
                        },
                    ],
                },
            }
        );
        return res.json({
            status: "ok",
            msg: "Logged in Successfully",
            token: token,
        });
    } catch (error) {
        return res.json({
            status: "error",
            msg: "something went wrong",
        });
    }
});

// ============== log-in ====================================

// ============== Forgot Password ====================================

router.post("/api/forgot-password", async (req, res) => {
    console.log("recieved a post request for forgot-password");
    await emailVerification(req, res);
});

router.get("/api/forgot-password/:token", async (req, res) => {
    const { token } = req.params
    console.log("recieved a get request to verify token for forgot password");
    try {
        let user = await User.findOne({ emailToken: token });
        if (!user) {
            return res.json({
                status: "error",
                msg: "Token is invalid or expired",
            });
        }
        await User.findOneAndUpdate(
            { emailToken: token },
            { $set: { verifiedForPasswordReset: true } }
        );
        return res.json({
            status: "ok",
            msg: "verified",
            emailToken: token
        });
    } catch (error) {
        console.log(error);
        res.json({
            status: "error",
            msg: "Token is invalid or expired",
        });
    }
});

router.post("/api/reset-password", async (req, res) => {
    const { new_password, confirm_password, token } = req.body;
    console.log("recieved a post request for reset password");
    try {
        const user = await User.findOne({ emailToken: token });
        if (!user) {
            return res.json({
                status: "error",
                msg: "Invalid token or token is expired",
            });
        }
        if(!user.verifiedForPasswordReset){
            return res.json({
                status: "error",
                msg: "You have no permissions"
            })
        }
        if (token !== user.emailToken || user.emailToken === null) {
            return res.json({
                status: "error",
                msg: "token is not valid or expired",
            });
        }
        
        if (new_password !== confirm_password) {
            res.json({ status: "error", msg: "password does not match" });
        }
        const password = await bcrypt.hash(new_password, 10);
        await User.findOneAndUpdate(
            { emailToken: token },
            { $set: { password: password, emailToken: null } }
        );
        return res.json({
            status: "ok",
            msg: "password changed successfullly",
        });
       
    } catch (e) {
        console.log(e);
        return res.json({ status: "error", msg: "something went wrong" });
    }
});

// ============== Forgot Password ====================================

module.exports = router;
