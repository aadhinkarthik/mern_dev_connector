const express = require('express');
const router = express.Router();

// @route  GET api/auth
// @desc   Test route for
// @access Public route
router.get('/', (req, res) => {
    res.send('Auth route successful');
})

module.exports = router;