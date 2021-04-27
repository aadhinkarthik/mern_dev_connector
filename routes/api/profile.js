const express = require('express');
const router = express.Router();

// @route  GET api/profile
// @desc   Test route for
// @access Public route
router.get('/', (req, res) => {
    res.send('Profile route successful');
})

module.exports = router;