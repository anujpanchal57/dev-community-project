const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator')

// @route GET api/auth
// @desc Test route for auth
// @access Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.id).select('-password')
        return res.status(200).json(user)
    } catch(err) {
        console.error(err.message)
        return res.status(500).json({response: "Server error, please try again"})
    }
})

// @route POST api/auth
// @desc Authenticate user and get token
// @access Public
router.post('/', [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }
        
        // Fetching required keys from the request body
        const { email, password } = req.body

        // See if the user already exists
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ response: "Invalid email" })
        }

        // Comparing the passwords
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({ response: "Invalid password" })
        }

        // Return JWT
        const payload = {
            id: user.id
        }


        jwt.sign(payload, config.get('jwtSecret'),  
        { expiresIn: 360000 }, 
        (err, token) => {
            if (err) throw err
            return res.status(200).json({
                response: 'User registered successfully',
                token: token,
                email: user.email,
                name: user.name
            })
        })

    } catch(err) {
        console.error(err.message)
        return res.status(500).send('Server error, please try again')
    }
})

module.exports = router