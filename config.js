const dotenv = require('dotenv')

dotenv.config()

module.exports = {
    MOGODB_URL: process.env.MONGODB_URL,
    JWT_SECRET: process.env.JWT_SECRET
}