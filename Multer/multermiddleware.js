  // const fs = require("fs");
  // const multer = require("multer");

  // if (!fs.existsSync("uploads")) {
  //   fs.mkdirSync("uploads");
  // }

  // const storage = multer.diskStorage({
  //   destination: (req, file, cb) => cb(null, "uploads/"),
  //   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
  // });

  // const upload = multer({ storage });

  // module.exports = { upload };

const multer = require("multer");

// Memory storage for Vercel serverless
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = { upload };
