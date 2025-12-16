// const { content } = require('pdfkit/js/page')
const { prompt } = require('../quizcheckerPrompt')
const {openai} = require('../setup')

// const checkQuiz =async({questions,answerImages})=>{
//    const messages=[
//     {
//         role:"system",
//         content:prompt
//     },
//     {
//         role:"user",
//         content:[
//             {
//                 type:"text",
//                 text:`Questions (in order): ${questions.map((question,index)=>`${index+1}.${question}`).join("\n")}
//                 Return JSON Exactly like:
//                 {
//                     "questions":[
//                     {"question":"Q1 text", "marks":number,"feedback":""}
//                     ],
//                     "total_marks:number
//                 }`    
//             },
//             ...answerImages.map(buffer=>({
//                 type:"image_url",
//                 image_url:{
//                     url:`data:image/jpeg;base64,${buffer.toString("base64")}`
//                 }
//             }))
//    ]}
//         ]
//         const response =await openai.chat.completions.create({
//             model:"gpt-4o-mini",
//             temperature:0.2,
//             messages:messages
//         })
//         return JSON.parse(response.choices[0].message.content)
//     }
   

// module.exports= {checkQuiz}


const checkQuiz = async ({ questions, answerImages }) => {
  console.log("Enter in Check Quiz Function");

  const response = await openai.responses.create({
    model: "gpt-4.1",
    temperature: 0.2,

    input: [
      {
        role: "system",
        content: prompt
      },
      {
        role: "user",
        content: [
          {
            // ✅ FIX 1: correct type
            type: "input_text",
            text: `
Questions (in order):
${questions.map((currentElement,currentIndex) => `${currentIndex + 1}. ${currentElement.question} (Per Question Marks: ${currentElement.marks}`).join("\n")}

Rules:
- Total quiz marks = 5
- Detect question boundaries automatically
- Answers may span multiple pages
- Ignore grammar & handwriting mistakes
- No teacher review

Return ONLY valid JSON:
{
  "questions": [
    { "question": "Q1 text","max_marks":, "marksObtained": , "feedback": "" }
  ],
  "total_marks": 5
}
`
          },

          // ✅ FIX 2: correct image input
  ...answerImages.map(buffer => ({
            type: "input_image",
            image_url: `data:image/jpeg;base64,${buffer.toString("base64")}`
          }))
        ]
      }
    ]
  });

  // ✅ FIX 3: safe JSON extraction
  const rawOutput = response.output_text;
  const cleanJSON = rawOutput.replace(/```json|```/g, "").trim();

  return JSON.parse(cleanJSON);
};

module.exports = { checkQuiz }
















// // const { content } = require('pdfkit/js/page')
// const { openai } = require('../setup')
// const { promopt } = require('../quizcheckerPrompt')
// // const { content } = require('pdfkit/js/page')
// // const { text } = require('pdfkit')
// const detectQuestionBoundries = async (questions, pageBlocks) => {
//     try {
//         const content= [
//                     {
//                         type: "text",
//                         text: `Questions:
//                     ${questions.map((question, index) => `Q${index + 1}:${question.text}`).join('\n')}
//                     For EACH image block:
//                     decide which question it belongs to.
//                     If irrelevant, return "NONE".

//                     Return JSON like:{
//                     "page_1_top":"Q1",
//                     "page_1_middle":"Q1",
//                     "page_1_bottom":"Q2"
//                     }
//                     `
//                     }]
//         for (const block of pageBlocks){
//             content.push({
//                 type:'image_url',
//                 image_url:{
//                     url:`data:image/jpeg;base64,${block.buffer.toString("base64")}`
//                 }
//             })
//         }                  

//         const response = await openai.chat.completions.create({
//             model: 'gpt-4o-mini',
//             temperature: 0,
//             messages:[
//                 {role:"system",content:promopt},
//                 {role:"user",content}
//             ]
//         })

//         return JSON.parse(response.choices[0].message.content)
//     } catch (error) {
//         console.log('Error in Question Detection Function', error)
//         return error}
// }



// const groupBlockPerQuestion=(mapping,pageBlocks)=>{
//     try {
//         const grouped ={}

//         for(const key in mapping){
//             const q = mapping[key]
//             if(q==='NONE') continue
//             if(!grouped[q]) grouped[q]=[]
//             const block= pageBlocks.find(b=>b.id===key)
//             if(block) grouped[q].push(block.buffer)
//         }
//     return grouped
//     } catch (error) {
//         console.log("Error in Grouping Function ",error)
//         return error
//     }
// }



// module.exports = { detectQuestionBoundries }