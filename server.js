const express = require('express')
const connectDB = require('./config/db')
const path = require('path')

// Initializing express
const app = express()

// Connecting the db
connectDB()

// Init middleware
app.use(express.json({extended: false}))

// Define routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/posts', require('./routes/api/posts'))

// Serve static assets in production
if(process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('client/build'))

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}

// Fetching the PORT from env variable and if not then 5000
const PORT = process.env.PORT || 5000

// Listens to a PORT when we start the server
app.listen(PORT, () => console.log('Server started on port ', PORT))

