const { assignmentCheckerHandler } = require('../../API Setup Routes/AssignmentController/assignmentChecker')
const { upload } = require('../../Multer/multermiddleware')

const router = require('express').Router()


// router.post('/assignmentFileChecker',upload.single('pdf'),checkPdfFile)
router.post('/assignmentChecker',upload.single('pdf'),assignmentCheckerHandler)
module.exports = router