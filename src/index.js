const express= require('express')
require('./db/mongoose')
const User = require('./models/user')
const userRouter = require('./routers/user')

//.......SETTING UP EXPRESS SERVER........//
const app = express()
const port= process.env.PORT || 3000
app.use(express.json())
app.use(userRouter)

//...........SETTING UP SERVER ON PORT.....//
app.listen(port, ()=> {
    console.log('SEREVER IS UP ON PORT ' + port)
})