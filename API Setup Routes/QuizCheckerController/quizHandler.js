// const { text } = require('pdfkit')
const {pdfToImageBuffer} =require('../../PDFToImageToBlocks/pdfToImage')
const { quizGeneratorPrompt, quizGeneratorViaFilePrompt } = require('../prompts')
const { openai } = require('../setup')
const {checkQuiz} = require('./questionBoundry')
const {cleanPdfText}=require('../AssignmentController/assignmentCreation')
const pdfParse = require("pdf-parse")
const quizGeneratorViaContent= async(req,res)=>{
    try {
   if (!req.file) return res.status(400).json({ success: false, message: "PDF required" })

    const fileBuffer = req.file.buffer;
    const pdfData = await pdfParse(fileBuffer)
    const text = cleanPdfText(pdfData.text)

     const response = await openai.responses.create({
        model:'gpt-4.1-mini',
        temperature:0.7,
        input:[
            {role:'system',content:quizGeneratorViaFilePrompt},
            {role:'user',content:`Text :${text} `
            
        }],
    })
    console.log(response)
    if(!response){
        console.log('Issue in Quiz generator function')
        return res.status(400).json({message:"Issue in Quiz Generator Function"})
    }
    const output = response.output_text
    const cleanJSON = output.replace(/```json|```/g, "").trim()
    const finalOuput=  JSON.parse(cleanJSON)
    console.log(finalOuput)
    return res.status(200).json({message:'Final Output is :',finalOuput})

  } 
  catch (error) {
    console.log("Error in Quiz Generator Function via Topic",error)
    return res.status(404).json({message:"Error in Quiz Generator Function via Topic",error})
  }       
}

const quizGeneratorByTopicName = async(req,res)=>{
try {
    const {topics} = req.body
    console.log(topics)
    
    const response = await openai.responses.create({
        model:'gpt-4.1-mini',
        temperature:0.7,
        input:[
            {role:'system',content:quizGeneratorPrompt},
            {role:'user',content:`Topics :${topics.join(" , ")} `
            
        }],
    })

    if(!response){
        console.log('Issue in Quiz generator function')
        return res.status(400).json({message:"Issue in Quiz Generator Function"})
    }
    const output = response.output_text
    const cleanJSON = output.replace(/```json|```/g, "").trim()
    const finalOuput=  JSON.parse(cleanJSON)
    console.log(finalOuput)
    return res.status(200).json({message:'Final Output is :',finalOuput})

} catch (error) {
    console.log("Error in Quiz Generator Function via Topic",error)
    return res.status(404).json({message:"Error in Quiz Generator Function via Topic",error})
}
}

const handler = async(req,res)=>{
    try {
        
        const {questions} = req.body
        const pdfFile = req.file
        // console.log(questions)
        // console.log(questions)
        const questionsArray =JSON.parse(questions)
        if(!Array.isArray(questionsArray)) res.status(400).json({error:"Invalid input "})
       
        if(!pdfFile) res.status(400).json({error:"File not Found"}) 
        
        const pdfBuffer = pdfFile.buffer
        
        const  answerImages= await pdfToImageBuffer(pdfBuffer)
        
        const result= await checkQuiz({
            questions:questionsArray,answerImages
        })
        if(!result){
            return res.status(401).json({message:'Issue in Function of Marks'})
        }
        return res.status(200).json({message:'Quiz Checked Successfully',success:true,result})
    } catch (error) {
        console.log("Issue in Handler Function ",error)
        return res.status(404).json({message:"Issue in Handler Function",error:error?.message,stack:error?.stack})
    }
}

module.exports={handler,quizGeneratorByTopicName,quizGeneratorViaContent}