const express = require('express')
const router = express.Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator')
const User = require('../../models/User')

// @route POST api/users
// @desc Register users
// @access Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Please enter a password of 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }
        
        // Fetching required keys from the request body
        const { name, email, password } = req.body

        // See if the user already exists
        let user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] })
        }

        // Fetch the gravatar profile
        // r: pg gives us images that are not nude
        // d: mm will return a default image if any image does not exist 
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        // Create an instance of the user
        user = new User({
            name, 
            email, 
            avatar, 
            password
        })

        // Encrypt password
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt)

        // Saving the user in the database
        await user.save()

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

        // return res.status(200).json({ response: "User registered" })
    } catch(err) {
        console.error(err.message)
        return res.status(500).send('Server error, please try again')
    }
})

module.exports = router