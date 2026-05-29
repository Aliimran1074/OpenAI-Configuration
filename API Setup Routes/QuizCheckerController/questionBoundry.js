const {quizCheckerPrompt} = require('../prompts')
const {openai} = require('../setup')

const checkQuiz = async ({ questions, answerImages,totalMarks }) => {
  console.log("Enter in Check Quiz Function");

  const response = await openai.responses.create({
    model: "gpt-4.1",
    temperature: 0.2,

    input: [
      {
        role: "system",
        content: quizCheckerPrompt
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
- Total Maximum Marks ${totalMarks}
- Detect question boundaries automatically
- Answers may span multiple pages
- Ignore grammar & handwriting mistakes
- No teacher review

Return ONLY valid JSON:
{
  "questions": [
    { "question": "Q1 text","max_marks":, "marksObtained": , "feedback": "" }
  ],
  "total_marks": 
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
  })
  
  // ✅ FIX 3: safe JSON extraction
  const rawOutput = response.output_text;
  const cleanJSON = rawOutput.replace(/```json|```/g, "").trim()
  // console.log("This is Final Data : ",cleanJSON)
  return JSON.parse(cleanJSON);
}

module.exports = { checkQuiz }
















