const { createAssignmentByGivingPdf, assignmentCreationByTopicName } = require('../../API Setup Routes/AssignmentController/assignmentCreation.js');
const { contentGenerator } = require('../../API Setup Routes/ContentGenerator/contentGenerator.js')
const {upload} =require("../../Multer/multermiddleware.js")


const router= require('express').Router()

router.post("/generate-assignment-from-pdf", upload.single("pdf"), createAssignmentByGivingPdf);
router.route('/generateText').post(contentGenerator)
router.route('/generateAssignmentByTopic').post(assignmentCreationByTopicName)
module.exports=router