const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

// Get User Model
const { User } = require('../../models/User');

// @route  POST api/user
// @desc   Register User
// @access Public
router.post('/', [

    // Pass Second params for custom error message
    check('fullName', 'Provide a valid Name').not().isEmpty(),
    check('email', 'Provide a valid Email').isEmail(),
    check('password', 'Provide a valid password with more than 8 characters').isLength({ min: 8 })
], async (req, res) => {

    const errors = validationResult(req);
    if (! errors.isEmpty()) {
        // Throw error list created by express validator
        return res.status(400).json({ errors: errors.array() });
    }

    // Get user details from payload
    const { fullName, email, password } = req.body;

    try {

        // Check for existing user
        let user = await User.findOne({ email: email });
        if (user) {
            // Reusing express validator error format for easy usage
            return res.status(400).json({ errors: [
                { msg: 'Hey! You already have an account. Try to Sign in' },
                { param: "email" }
            ] });
        }

        // Get avatar from gravatar
        const avatar = gravatar.url(email, {
            s: '200', // Size
            r: 'g', // Avatar Rating
            d: 'mm' // Default image
        }, true);

        user = new User({
            fullName: fullName,
            email: email,
            password: password,
            avatar: avatar
        });

        // Use await when anything returns promise rather than 'then' 

        // Create Salt to do hashing, default 10 rounds
        const salt = await bcrypt.genSalt();

        user.password = await bcrypt.hash(password, salt);

        // Save user
        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload,
            config.get('jwtToken'),
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                res.json({ jwtToken: token });
            }
        );
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;