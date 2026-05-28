const { pdfToImageBuffer } = require('../../PDFToImageToBlocks/pdfToImage')
const {detectPdfFileType}= require('../AssignmentFileJustification/fileJustification')
const { assignmentCheckerPrompt } = require('../prompts.js')
const {openai} = require('../setup')


// const checkAssignment = async ( questions, content ) => {

//   // plagarism wala kaam karna hai (FYP 1  ke baad)
//   const contentType= content.type
//   console.log("PDF Type:",contentType)
  
//   if(contentType=="MIXED" ){ 
//     const pages = content.pdfPages
//   const images = pages.map(page=>page.image)
//   const text = pages.map(page=>page.text)
//     const response = await openai.responses.create({
//     model: "gpt-4.1",
//     temperature: 0.2,

//     input: [
//       {
//         role: "system",
//         content: assignmentCheckerPrompt
//       },
//       {
//         role: "user",
//         content: [
//           {
//             type: "input_text",
//             text: `
// Questions (in order):
// ${questions.map((currentElement,currentIndex) => `${currentIndex + 1}. ${currentElement.question}`)}`},
//   ...text.map(text =>({
//       type:"input_text",
//       text
//   })),
//   ...images.map(buffer => ({
//             type: "input_image",
//             image_url: `data:image/jpeg;base64,${buffer.toString("base64")}`
//           }))
//         ]
//       }
//     ]
//   })
//   const rawOutput = response.output_text;
//   const cleanJSON = rawOutput.replace(/```json|```/g, "").trim();

//   return JSON.parse(cleanJSON);
// }
// else if(contentType=="SCANNED"){
//     const images = content.pdfImages
//   // const images = pages.map(page=>page.image)
//   // const text = pages.map(page=>page.text)
//     const response = await openai.responses.create({
//     model: "gpt-4.1",
//     temperature: 0.2,

//     input: [
//       {
//         role: "system",
//         content: assignmentCheckerPrompt
//       },
//       {
//         role: "user",
//         content: [
//           {
//             type: "input_text",
//             text: `
// Questions (in order):
// ${questions.map((currentElement,currentIndex) => `${currentIndex + 1}. ${currentElement.question}`)}`},
//    ...images.map(buffer => ({
//             type: "input_image",
//             image_url: `data:image/jpeg;base64,${buffer.toString("base64")}`
//           }))
//         ]
//       }
//     ]
//   })
//   const rawOutput = response.output_text;
//   const cleanJSON = rawOutput.replace(/```json|```/g, "").trim();

//   return JSON.parse(cleanJSON)
// }
// else{ 
//   const text = content.textPages
//   // console.log(pages)
//     const response = await openai.responses.create({
//     model: "gpt-4.1",
//     temperature: 0.2,

//     input: [
//       {
//         role: "system",
//         content: assignmentCheckerPrompt
//       },
//       {
//         role: "user",
//         content: [
//           {
//             //  FIX 1: correct type
//             type: "input_text",
//             text: `
// Questions (in order):
// ${questions.map((currentElement,currentIndex) => `${currentIndex + 1}. ${currentElement.question}`)}`
//           },
//         ...text.map(text=>({
//           type:'input_text',
//           text          
//         }))
//           ]
//       }
//     ]
//   })

//   // FIX 3: safe JSON extraction
//   const rawOutput = response.output_text;
//   const cleanJSON = rawOutput.replace(/```json|```/g, "").trim();

//   return JSON.parse(cleanJSON);
// }

// }



// const assignmentCheckerHandler = async(req,res)=>{
//   try {
//     const {questions} = req.body
//     const pdfFile = req.file
//     const questionsArray = JSON.parse(questions)
//     console.log("Question Array : ",questionsArray)
//     console.log(questionsArray.length)
    
//     if(!Array.isArray(questionsArray)) return res.status(400).json({message:"Invalid Input"})
     
//       if(!pdfFile) return res.status(404).json({message:"No Such File Found"})
//       const pdfBuffer = pdfFile.buffer
//       const checkFileType = await detectPdfFileType(pdfBuffer)
//       // console.log('Check File Type :',checkFileType)
//       const checkAssignmentData = await checkAssignment(questionsArray,checkFileType)
//       if(!checkAssignmentData){
//         return res.status(404).json({message:"Issue in Assignment Data Function"})
//       }
//       console.log(checkAssignmentData)
//       return res.status(200).json({message:"Assignment Output Data",checkAssignmentData})    

//   } catch (error) {
//     console.log('Error in  Assignment Handler Function',error)
//     return res.status(404).json({message:'Error in  Assignment Handler Function',error})
//   }
// }


// Note: Ensure you have initialized openai correctly:
// const { OpenAI } = require('openai');
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const assignmentCheckerHandler = async (req, res) => {
  try {
    // req.body se questions aur overall totalMarks dono le rahe hain
    const { questions, total_marks } = req.body; 
    const pdfFile = req.file;

    // Check if variables exist
    if (!questions) return res.status(400).json({ message: "Questions array is required" });
    if (!pdfFile) return res.status(404).json({ message: "No Such File Found" });

    const questionsArray = JSON.parse(questions);
    console.log("Question Array : ", questionsArray);
    console.log("Total Marks Input : ", total_marks);

    if (!Array.isArray(questionsArray)) {
      return res.status(400).json({ message: "Invalid Input: Questions must be an array" });
    }

    const pdfBuffer = pdfFile.buffer;
    
    // File ka structure detect karne ke liye helper call (Ensure this function exists in your project)
    const checkFileType = await detectPdfFileType(pdfBuffer);
    
    // Evaluation core logic function trigger
    const checkAssignmentData = await checkAssignment(questionsArray, checkFileType, total_marks);
    
    if (!checkAssignmentData) {
      return res.status(404).json({ message: "Issue in Assignment Data Function" });
    }
    
    console.log("Evaluation Successful!");
    return res.status(200).json({ message: "Assignment Output Data", checkAssignmentData });

  } catch (error) {
    console.log('Error in Assignment Handler Function:', error);
    return res.status(500).json({ message: 'Error in Assignment Handler Function', error: error.message });
  }
};

const checkAssignment = async (questions, content, totalMarks) => {
  try {
    const contentType = content.type;
    console.log("PDF Type:", contentType);

    // 1. Total marks input ko float mein convert karna aur per-question marks nikaalna
    const overallTotal = totalMarks ? parseFloat(totalMarks) : 100;
    const totalQuestions = questions.length;
    
    // Har question ke max marks (Misaal ke taur par: 10 / 6 = 1.6666... isay decimals ke sath rakhein taake AI calculate kar sake)
    const calculatedMaxMarks = totalQuestions > 0 ? parseFloat((overallTotal / totalQuestions).toFixed(2)) : 5;

    // 2. Questions ko structured string mein convert karna taake AI ko exact sawal milein
    const formattedQuestions = questions.map((q, idx) => {
      const questionText = typeof q === 'string' ? q : (q.question || '');
      return `${idx + 1}. Question: "${questionText}" (Max Marks: ${calculatedMaxMarks})`;
    }).join('\n');

    // OpenAI payload array initialize karna
    let userContent = [
      {
        type: "text",
        text: `Strictly evaluate the attached student assignment based ONLY on these specific questions:\n\n${formattedQuestions}`
      }
    ];

    // 3. File type ke mutabiq content ko structure karna
    if (contentType === "MIXED") {
      const pages = content.pdfPages;
      pages.forEach(page => {
        if (page.text) userContent.push({ type: "text", text: page.text });
      });
      pages.forEach(page => {
        if (page.image) {
          userContent.push({
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${page.image.toString("base64")}` }
          });
        }
      });

    } else if (contentType === "SCANNED") {
      const images = content.pdfImages;
      images.forEach(buffer => {
        userContent.push({
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${buffer.toString("base64")}` }
        });
      });

    } else { 
      // TEXT type
      const textPages = content.textPages;
      textPages.forEach(text => {
        if (text) userContent.push({ type: "text", text: text });
      });
    }

    // 4. OpenAI Chat Completion Call (gpt-4o-mini with forced JSON object)
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      temperature: 0.1,    // Strict evaluation rules follow karne ke liye lowest configuration
      response_format: { type: "json_object" }, 
      messages: [
        {
          role: "system",
          content: assignmentCheckerPrompt
        },
        {
          role: "user",
          content: userContent
        }
      ]
    });

    // 5. Response Extract aur Clean Parsing Logic
    const rawOutput = response.choices[0].message.content;
    const parsedData = JSON.parse(rawOutput);

    // 6. 🛠️ Decimal Overlap / Rounding Correction Logic (Fixes the 10.2 issue)
    if (parsedData.questions && Array.isArray(parsedData.questions)) {
      let calculatedTotal = 0;
      
      parsedData.questions.forEach(q => {
        // AI ko forcing k marksObtained kabhi max_marks se exceed na karein rounding ki wajah se
        if (q.marksObtained > q.max_marks) {
          q.marksObtained = q.max_marks;
        }
        calculatedTotal += q.marksObtained;
      });

      // Agar total calculated marks aur original user input total mein thoda sa decimal farq hai (jaise 10.2 vs 10)
      // aur bache ke saare full marks hain, toh direct input total marks assign kar do.
      if (Math.abs(calculatedTotal - overallTotal) <= 0.5) {
        parsedData.total_marks = parseFloat(overallTotal.toFixed(1));
      } else {
        // Agar bache ke marks kate hain toh actual calculated sum ko 1 decimal point tak save karo
        parsedData.total_marks = parseFloat(calculatedTotal.toFixed(1));
      }
    }

    return parsedData;

  } catch (error) {
    console.log("Error in checkAssignment Core Function:", error);
    throw error; // Isay throw kar rahe hain taake handler ka catch block trigger ho sake
  }
}


module.exports= {assignmentCheckerHandler}


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