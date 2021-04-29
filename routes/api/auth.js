const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');

// @route  GET api/auth
// @desc   Test route for
// @access Public route
router.get('/', auth, (req, res) => {
    res.send('Auth route successful');
})

module.exports = router;