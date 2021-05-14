const express = require('express');
const { check, validationResult } = require('express-validator');
const { auth } = require('../../middleware/auth');
const { trim } = require('../../middleware/helpers');
const { Post } = require('../../models/Post');
const { Profile } = require('../../models/Profile');
const { User } = require('../../models/User');
const router = express.Router();

// @route  POST api/posts
// @desc   Create a post
// @access Private
router.post('/', [auth, trim, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {

    const errors = validationResult(req);
    if (! errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            text: req.body.text,
            name: user.fullName,
            avatar: user.avatar,
            user: req.user.id
        });

        const post = await newPost.save();
        res.json(post);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
});

// @route  GET api/posts
// @desc   Get all posts
// @access Private
router.get('/', auth, async (req, res) => {

    try {
        const posts = await Post.find().sort({ date: -1}) // Fetch recent posts first
        res.json(posts);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
});

// @route  GET api/posts/:post_id
// @desc   Get post by ID
// @access Private
router.get('/:post_id', auth, async (req, res) => {

    try {

        const post = await Post.findById(req.params.post_id);
        if (! post) {
            return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
        }

        res.json(post);
    } catch (error) {
        console.log(error.message);
        if(error.kind == 'ObjectId') {
            return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
        }
        res.status(500).send('Internal Server Error');
    }
});

// @route  DELETE api/posts/:post_id
// @desc   Get post by ID
// @access Private
router.delete('/:post_id', auth, async (req, res) => {

    try {

        const post = await Post.findById(req.params.post_id);
        if (! post) {
            return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
        }
        
        if (post.user != req.user.id) {
            return res.status(401).json({ errors: [{ msg: 'User not authorized' }] });
        }
        
        await post.remove();
        
        res.json({ msg: 'Post removed' });
    } catch (error) {
        console.log(error.message);
        if(error.kind == 'ObjectId') {
            return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
        }
        res.status(500).send('Internal Server Error');
    }
});

// @route  PUT api/posts/like/:post_id
// @desc   Like a post
// @access Private
router.put('/like/:post_id', auth, async (req, res) => {
    
    try {
        const post = await Post.findById(req.params.post_id);
        
        if (! post) {
            return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
        }
        
        if (post.likes.filter(like => like.user == req.user.id).length > 0) {
            return res.status(400).json({ errors: [{ msg: 'Post already liked' }] });
        }

        post.likes.unshift({ user: req.user.id });

        await post.save();
        res.json(post.likes);
    } catch (error) {
        console.log(error.message);
        if(error.kind == 'ObjectId') {
            return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
        }
        res.status(500).send('Internal Server Error');
    }
});

// @route  PUT api/posts/unlike/:post_id
// @desc   Like a post
// @access Private
router.put('/unlike/:post_id', auth, async (req, res) => {
    
    try {
        const post = await Post.findById(req.params.post_id);
        
        if (! post) {
            return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
        }
        
        if (post.likes.filter(like => like.user == req.user.id).length == 0) {
            return res.status(400).json({ errors: [{ msg: 'Post has not liked yet' }] });
        }

        const likeIndex = post.likes.map(like => like.user).indexOf(req.user.id);
        post.likes.splice(likeIndex, 1);

        await post.save();
        res.json(post.likes);
    } catch (error) {
        console.log(error.message);
        if(error.kind == 'ObjectId') {
            return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
        }
        res.status(500).send('Internal Server Error');
    }
});

// @route  POST api/posts/comment/:post_id
// @desc   Comment a post
// @access Private
router.post('/comment/:post_id', [auth, trim, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {

    const errors = validationResult(req);
    if (! errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.post_id);

        const newComment = {
            text: req.body.text,
            name: user.fullName,
            avatar: user.avatar,
            user: req.user.id
        };

        post.comments.unshift(newComment);
        await post.save();

        res.json(post.comments);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
});

// @route  DELETE api/posts/comment/:post_id/:comment_id
// @desc   Delete a comment
// @access Private
router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {

    try {

        const post = await Post.findById(req.params.post_id);
        if (! post) {
            return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
        }

        const comment = post.comments.find(comment => comment.id === req.params.comment_id);
        if (! comment) {
            return res.status(404).json({ errors: [{ msg: 'Comment not found' }] });
        }

        if (comment.user != req.user.id) {
            return res.status(401).json({ errors: [{ msg: 'User not authorized' }] });
        }

        const commentIndex = post.comments.map(comment => comment.user).indexOf(req.user.id);
        post.comments.splice(commentIndex, 1);

        await post.save();
        res.json(post.comments);
    } catch (error) {
        console.log(error.message);
        if(error.kind == 'ObjectId') {
            return res.status(404).json({ errors: [{ msg: 'Post or Comment not found' }] });
        }
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;