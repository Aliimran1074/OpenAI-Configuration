// const formidable = require('formidable')

// const formidableMiddleware = require('express-formidable')
const { handler, quizGeneratorByTopicName } = require('../../API Setup Routes/QuizCheckerController/quizHandler')
const { upload } = require('../../Multer/multermiddleware')
const router=require('express').Router() 


router.post('/quizChecker',upload.single('pdf'),handler)
router.route('/quizGeneratorByTopicName').post(quizGeneratorByTopicName)

module.exports =router