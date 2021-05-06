const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const { trim } = require('../../middleware/helpers');
const { auth } = require('../../middleware/auth');
const { User } = require('../../models/User')

// @route  GET api/auth
// @desc   Get User data for token
// @access Private
router.get('/', auth, async (req, res) => {

    try {

        // This is protected route where req.user has id as its decoded from token
        const user = await User.findById(req.user.id).select('-password');
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
    res.send('Auth route successful');
});


// @route  POST api/user
// @desc   Register User
// @access Public
router.post('/', trim, [
    check('email', 'Provide a valid Email').isEmail(),
    check('password', 'Password not provided').exists()
], async (req, res) => {

    const errors = validationResult(req);
    if (! errors.isEmpty()) {
        // Throw error list created by express validator
        return res.status(400).json({ errors: errors.array() });
    }

    // Get user details from payload
    const { email, password } = req.body;

    try {

        // Check if the user exists
        let user = await User.findOne({ email: email });
        if (! user) {
            // Reusing express validator error format for easy usage
            return res.status(400).json({ errors: [
                { msg: 'Invalid credentials', param: "email" }
            ] });
        }

        let isPasswordMatched = await bcrypt.compare(password, user.password);

        if (! isPasswordMatched) {
            // Provide similar error message for security reasons
            // So that existing emails can't be identified 
            return res.status(401).json({ errors: [
                { msg: 'Invalid credentials' }
            ] });
        }

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
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
