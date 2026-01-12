// const formidable = require('formidable')

// const formidableMiddleware = require('express-formidable')
const { handler, quizGeneratorByTopicName, quizGeneratorViaContent } = require('../../API Setup Routes/QuizCheckerController/quizHandler')
const { upload } = require('../../Multer/multermiddleware')
const router=require('express').Router() 


router.post('/quizChecker',upload.single('pdf'),handler)
router.post('/quizGeneratorViaContent',upload.single('pdf'),quizGeneratorViaContent)
router.route('/quizGeneratorByTopicName').post(quizGeneratorByTopicName)


module.exports =router