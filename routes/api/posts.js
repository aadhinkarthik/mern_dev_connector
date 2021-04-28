const express = require('express');
const router = express.Router();

// @route  GET api/posts
// @desc   Test route for
// @access Public route
router.get('/', (req, res) => {
    res.send('Posts route successful');
})

module.exports = router;