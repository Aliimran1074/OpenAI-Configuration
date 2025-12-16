const multer = require("multer")

// Memory storage for Vercel serverless
const storage = multer.memoryStorage()

const upload = multer({ storage })

module.exports = { upload }
