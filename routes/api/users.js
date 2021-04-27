const express = require('express');
const router = express.Router();

// @route  GET api/users
// @desc   Test route for
// @access Public route
router.get('/', (req, res) => {
    res.send('Users route successful');
})

module.exports = router;