const {openai}= require('../setup') 

// This function will provide a slide content for course content 
const contentGenerator = async (req, res) => {

    try {
        const { topics } = req.body
        if(!topics || !Array.isArray(topics) || topics.length===0){
            console.log('No Topic Available')
            return res.status(400).json({message:'Please Provide Input'})
        }
    const instruction = `You are a teaching assistant. I will provide you an array of topics. For each topic, generate content suitable for student slides.Follow this format for each topic
    :Topic: <Topic Name>
    - Slide 1: Title-
    Slide 2: Overview (bullet points)-
    Slide 3: Key Concepts (bullet points)-
    Slide 4: Real-life examples-
    Slide 5: Summary
    Keep each slide concise, clear, and easy for students to understand.Return the output as JSON with each topic as a key and its slides content as value.`
        const topicList = `Topics : ${JSON.stringify(topics)}`
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

module.exports = { contentGenerator }
