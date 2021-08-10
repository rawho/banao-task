require('dotenv').config({ path: '.env' })
const express = require('express')
const mongoose = require('mongoose')
require('./src/connect/mongoose');
const cors = require('cors');
const authRoutes = require('./src/routes/userAuth')

const app = express()

const port = process.env.PORT || 5000


app.use(express.json())
app.use(cors())
app.use(authRoutes)


app.listen(port, '0.0.0.0', () => {
    console.log('Server is up on port ' + port)
})