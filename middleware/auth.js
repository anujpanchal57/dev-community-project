const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = function(req, res, next) {
    // Fetch token from the header
    const token = req.header('x-auth-token')

    // Send an error, if token not present
    if (!token) {
        return res.status(401).json({response: "No token present, authorization denied"})
    }

    // Verify token, if present
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'))
        req.id = decoded.id
        next()
    } catch(err) {
        return res.status(401).json({response: "Token not valid"})
    }
}