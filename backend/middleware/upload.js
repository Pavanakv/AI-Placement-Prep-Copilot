// middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const audioDir = path.join(__dirname, "../uploads/audio");
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, audioDir),
  filename: (req, file, cb) => cb(null, `audio_${Date.now()}.webm`),
});

const uploadAudio = multer({ storage }).single("audio");
module.exports = { uploadAudio };