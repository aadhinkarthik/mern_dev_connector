const jwt = require('jsonwebtoken');
const config = require('config');

exports.auth = function (req, res, next) {

    // Get token from header
    const token = req.header('Authorization');
    if (! token) {
        return res.status(401).json({ errors: [
            { msg: 'No token provided. Permission denied' }
        ] });
    }

    // Verify token
    try {
        const decode = jwt.verify(token, config.get('jwtToken'));
        req.user = decode.user;
        next();
    } catch (err) {
        console.log(err.message);
        res.status(401).json({ errors: [
            { msg: 'Invalid token provided' }
        ] });
    }
}