require('dotenv').config()
const { OpenAI } = require('openai')
const apiKey = process.env.OPENAI_API_KEY  
const openai = new OpenAI({ apiKey: apiKey })

module.exports = {openai} 