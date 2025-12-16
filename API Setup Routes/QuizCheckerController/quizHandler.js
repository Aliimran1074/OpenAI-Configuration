const {pdfToImageBuffer} =require('../../PDFToImageToBlocks/pdfToImage')
const {checkQuiz} = require('./questionBoundry')

const handler = async(req,res)=>{
    try {
        
        const {questions} = req.body
        const pdfFile = req.file
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

module.exports={handler}