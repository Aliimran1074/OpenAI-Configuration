// require('dotenv').config()
require('dotenv').config({ path: './.env' })
const express= require('express')
const app= express()
const cors= require('cors')
const port = process.env.Port
const contentGenerator= require('./Router/TextGeneratorRoutes/textGeneratorRoute')
const quizRoutes= require('./Router/QuizRoutes/quizroutes')
const assignmentRoutes = require('./Router/AssignmentRoutes/assignmentRoutes')

// const contentGenerator= require('../Router')
app.use(cors())
app.use(express.json())
app.use('/setup',contentGenerator) 
app.use('/quiz',quizRoutes)
app.use('/assignment',assignmentRoutes)
app.get('/',(req,res)=>{
    res.send("Server is Running Without any error")
})
app.listen(port,()=>{
console.log("App listen on port ",port)

})
console.log('Ali Imran')

