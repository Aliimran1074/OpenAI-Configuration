const { pdfToImageBuffer } = require('../../PDFToImageToBlocks/pdfToImage')
const {detectPdfFileType}= require('../AssignmentFileJustification/fileJustification')
const { assignmentCheckerPrompt } = require('../prompts.js')
const {openai} = require('../setup')

const checkAssignment = async ( questions, content ) => {
  const contentType= content.type
  console.log("PDF Type:",contentType)
  
  if(contentType=="MIXED" || contentType=="SCANNED"){ 
    const pages = content.pdfPages
  const images = pages.map(page=>page.image)
  const text = pages.map(page=>page.text)
    const response = await openai.responses.create({
    model: "gpt-4.1",
    temperature: 0.2,

    input: [
      {
        role: "system",
        content: assignmentCheckerPrompt
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `
Questions (in order):
${questions.map((currentElement,currentIndex) => `${currentIndex + 1}. ${currentElement.question}`)}`},
  ...text.map(text =>({
      type:"input_text",
      text
  })),
  ...images.map(buffer => ({
            type: "input_image",
            image_url: `data:image/jpeg;base64,${buffer.toString("base64")}`
          }))
        ]
      }
    ]
  })
  const rawOutput = response.output_text;
  const cleanJSON = rawOutput.replace(/```json|```/g, "").trim();

  return JSON.parse(cleanJSON);
}
else{ 
  const text = content.textPages
  // console.log(pages)
    const response = await openai.responses.create({
    model: "gpt-4.1",
    temperature: 0.2,

    input: [
      {
        role: "system",
        content: assignmentCheckerPrompt
      },
      {
        role: "user",
        content: [
          {
            //  FIX 1: correct type
            type: "input_text",
            text: `
Questions (in order):
${questions.map((currentElement,currentIndex) => `${currentIndex + 1}. ${currentElement.question}`)}`
          },
        ...text.map(text=>({
          type:'input_text',
          text          
        }))
          ]
      }
    ]
  })

  // FIX 3: safe JSON extraction
  const rawOutput = response.output_text;
  const cleanJSON = rawOutput.replace(/```json|```/g, "").trim();

  return JSON.parse(cleanJSON);
}

}
// const checkPdfFile = async(buffer)=>{
// try {
//   // if(!req.file) return res.status(400).json({message:"PDF not Found"})
//     // console.log("File:",req.file)
//     // const pdfBuffer= req.file.buffer
//     const data = await detectPdfFileType(buffer)
//     console.log(data)
//     if(!data){
//       return res.status(400).json({message:"Issue in Getting File Data"})
//     }
//     // const pdfType = data.type
//     // if(pdfType=="MIXED" || pdfType=="SCANNED") {
//     //  const images =  await pdfToImageBuffer(pdfBuffer)
//     // //  run logic to check assignment of pics
//     //  } console.log('PDF type:',data.type)
     
//     return res.status(200).json({message:"Data of PDF Found",data})
// } catch (error) {
//   console.log(" Error in  Check PDF File Function",error)
//   return res.status(404).json({message:"Error in Check PDF File Function",error})
// }
// }


const assignmentCheckerHandler = async(req,res)=>{
  try {
    const {questions} = req.body
    const pdfFile = req.file
    const questionsArray = JSON.parse(questions)
    console.log(questions)
    console.log(questionsArray.length)
    if(!Array.isArray(questionsArray)) return res.status(400).json({message:"Invalid Input"})
     
      if(!pdfFile) return res.status(404).json({message:"No Such File Found"})
      const pdfBuffer = pdfFile.buffer
      const checkFileType = await detectPdfFileType(pdfBuffer)
      // console.log('Check File Type :',checkFileType)
      const checkAssignmentData = await checkAssignment(questionsArray,checkFileType)
      if(!checkAssignmentData){
        return res.status(404).json({message:"Issue in Assignment Data Function"})
      }
      console.log(checkAssignmentData)
      return res.status(200).json({message:"Assignment Output Data",checkAssignmentData})    

  } catch (error) {
    console.log('Error in  Assignment Handler Function',error)
    return res.status(404).json("Error in Assignment Handler Function",error)
  }
}

module.exports= {assignmentCheckerHandler}


// Rules:
// - Total assignment marks = 5
// - Detect question boundaries automatically
// - Answers may span multiple pages
// - Ignore grammar & handwriting mistakes (if handwritten)
// - No teacher review

// Return ONLY valid JSON:
// {
//   "questions": [
//     { "question": "Q1 text","max_marks":, "marksObtained": , "feedback": "" }
//   ],
//   "total_marks": 
// }