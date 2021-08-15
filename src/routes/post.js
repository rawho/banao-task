const express = require('express')
const router = express.Router()
const Post = require('../models/post')
const auth = require("../middlewares/auth")
const { NotBeforeError } = require('jsonwebtoken')

// Create a post
router.post('/api/post', auth,  async(req, res) => {

    const { desc, imageUrl } = req.body

    const newPost = new Post({ desc, imageUrl, userId: req.user._id})

    try{
        const savedPost = await newPost.save();
        res.status(200).json({
            status: "ok",
            msg: "Post created successfully",
            post: savedPost
        })
    } catch (err) {
        res.status(500).json({
            status: "error",
            msg: err
        })
    }

})

// Update a Post
router.put('/api/post/:id', auth, async(req, res) => {
    try{
        const post = await Post.findById(req.params.id)
        if(post.userId == req.user._id){
            await post.updateOne({$set: req.body})
            res.status(200).json({
                status: 'ok',
                msg: "the post has been updated"
            })
        } else {
            res.status(403).json({
                status: "error",
                msg: 'You can update only your post'
            })
        }
    } catch (err) {
        res.status(500).json({
            status: "error",
            msg: err
        })
    }
})

// Delete a post
router.delete('/api/post/:id', auth, async(req, res) => {
    try{
        const post = await Post.findById(req.params.id)
        if(post.userId == req.user._id){
            await post.deleteOne()
            res.status(200).json({
                status: 'ok',
                msg: "the post has been deleted"
            })
        } else {
            res.status(403).json({
                status: "error",
                msg: 'You can delete only your post'
            })
        }
    } catch (err) {
        res.status(500).json({
            status: "error",
            msg: err
        })
    }
})


// Like/Dislike a Post
router.put("/api/post/:id/like", auth, async (req, res) => {
    try{
        const post = await Post.findById(req.params.id)
        if(!post.likes.includes(req.user._id)){
            await post.updateOne({ $push: {likes: req.user._id} })
            res.status(200).json({
                status: "ok",
                msg: "post liked successfully"
            })
        } else {
            await post.updateOne({$pull: {likes: req.user._id}})
            res.status(200).json({
                status: "ok",
                msg: "post disliked successfully"
            })
        }
    } catch (err) {
        res.status(500).json({
            status: "error",
            msg: err
        })
    }
})

// Get a post
router.get('/api/post/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        res.status(200).json({
            status: "ok",
            msg: "post received",
            post: post
        })
    }catch (err) {
        res.status(500).json({
            status: "error",
            msg: err
        })
    }
})



module.exports = router