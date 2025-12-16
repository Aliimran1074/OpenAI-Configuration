const {pdfToImageBuffer} =require('../../PDFToImageToBlocks/pdfToImage')
const {checkQuiz} = require('./questionBoundry')
// const {upload}= require('../../Multer/multermiddleware')
const handler = async(req,res)=>{
    try {
        // const form = formidable({multiples:false})

        // const {fields,files}= await new Promise((resolve,reject)=>{
        //     form.parse(req,(error,fields,files)=>{
        //         if(error) reject(error)
        //         else resolve ({fields,files})    
        //     })
        // })

        // const {questions,answerPdf}=req.body
        const {questions} = req.body
        const pdfFile = req.file
        // console.log(questions)
        const questionsArray =JSON.parse(questions)
        // console.log(pdfFile)
        if(!Array.isArray(questionsArray)) res.status(400).json({error:"Invalid input "})
       
        if(!pdfFile) res.status(400).json({error:"File not Found"}) 
        // const answerPdf=files.answerPdf
        // console.log(pdfFile)
        const pdfBuffer = pdfFile.buffer
        // const pdfBuffer= Buffer.from(answerPdf,'base64')
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

module.exports={handler}