const mongoose = require('mongoose')

mongoose.connect(process.env.dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(result => console.log('connected to db'))
    .catch(err => console.log(err))