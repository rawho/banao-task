const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types
const PostSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: "User",
        required: true
    }, 
    desc: {
        type: String,
        max: 500
    }, 
    imageUrl: {
        type: String
    }, 
    likes: {
        type: Array,
        default: []
    },
    comments: [{
        comment: String,
        postedBy: {
            type: ObjectId,
            ref: "User"
        }
    }]

}, {timestamps: true})

module.exports = mongoose.model('Post', PostSchema)