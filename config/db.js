const mongoose = require('mongoose')
const config = require('config')

const db = config.get('mongoURI')

// Connecting to mongoDB
// useNewUrlParser is being used for parsing new mongoDB URI strings
// useUnifiedTopology is being used for significant refactor of how it handles monitoring all the servers in a replica set or sharded cluster
const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
        console.log('MongoDB connected')
    } catch(err) {
        console.error(err.message)
        // Exit the process on failure
        process.exit(1)
    }
}

module.exports = connectDB;