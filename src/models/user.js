const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
    username: { 
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
        if (!validator.isEmail(value)) {
            throw new Error('Email is invalid')
            }
        }
    },
    emailToken: {
        type: String
    },
    verifiedForPasswordReset: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
        }
    }]
},{collection: 'User' , timestamp: true})

const model = mongoose.model('UserSchema', UserSchema)

module.exports = model
