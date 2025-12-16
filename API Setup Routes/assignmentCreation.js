const {openai} = require('./setup')
const fs = require('fs')
const pdfParse = require("pdf-parse")
// const pdfParse = require("pdf-parse").default || require("pdf-parse");

const assignmentCreationByTopicName=async(req,res)=>{
    try {
        const {topicsName,difficultyLevel,format,noOfQuestions}=req.body
        console.log("Topics Name :",topicsName)
        if(!topicsName || !Array.isArray(topicsName) ||topicsName.length===0){
            console.log("Please Provide Topic")
            return res.status(400).json({message:"Please Provide Topic"})
        }
        const instruction = `You are a teaching assistant. I will provide you an array of topics.You will create an assignment consist of ${noOfQuestions} question with diffculty level : ${difficultyLevel} and format will be ${format} based`
        const topicList = `Topics : ${JSON.stringify(topicsName)}`
        const prompt = `${instruction} \n\n ${topicList}`
       
        const result = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }]
        })
        if (!result) {
            console.log("Issue in Setup")
            return res.status(400).json({ message: 'Issue in Setup' })
        }
        console.log(result)
        const finalResult = result.choices[0].message.content
        return res.status(200).json({ message: 'Done', finalResult })
    } catch (error) {
        console.log("Error in Setup Function",error)
        return res.status(404).json({message:'Error in Setup Function',error})
    }
}

function cleanPdfText(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l !== "");
  const freq = {};
  lines.forEach(line => { freq[line] = (freq[line] || 0) + 1 });
  const totalLines = lines.length;

  const protectedKeywords = [
    "definition", "concept", "example", "explain", "introduction",
    "summary", "topic", "advantages", "disadvantages"
  ];

  const repeatingLines = Object.keys(freq).filter(line => {
    if (freq[line] < 3) return false;
    if (line.length > 50) return false;
    const lower = line.toLowerCase();
    if (protectedKeywords.some(k => lower.includes(k))) return false;
    if (freq[line] < totalLines * 0.4) return false;
    return true;
  });

  return lines.filter(line => !repeatingLines.includes(line)).join("\n");
}

const createAssignmentByGivingPdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "PDF required" });

    // const fileBuffer = fs.readFileSync(req.file.path);
    const fileBuffer = req.file.buffer;
    const pdfData = await pdfParse(fileBuffer);
    const text = cleanPdfText(pdfData.text);

    const prompt = `
I am providing you a text which will extract from a pdf you will have to create an assignmnet of medium level consist me of 3 questions from it , but remember its a text from pdf so chances of any header footer any irrelvant text so avoid the irrevalnat text and make assignment from the relevant topic,Extract 3 medium-level assignment questions from this PDF text. Ignore headers, footers, or irrelevant content.Return ONLY a valid JSON object. 
Do NOT wrap the   JSON in quotes. 
Do NOT escape characters. 
Do NOT include \n, \t, or + anywhere. 
Do NOT return any explanation outside the JSON.
Format:
{
  "title": "Assignment Title",
  "questions": [
    "Question 1",
    "Question 2",
    "Question 3"
  ]
}
${text}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert examiner." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2
    });
    console.log(response)
    return res.json({
      success: true,
      assignment: response.choices[0].message.content
    });
 
  } catch (err) {
    console.error("Error generating assignment:", err);
    return res.status(500).json({ success: false, error: err.message || "AI error" });
  }
};


// module.exports = { createAssignmentByGivingPdf };
module.exports={createAssignmentByGivingPdf,assignmentCreationByTopicName}