const express = require("express");
const router = express.Router();
const { uploadAudio } = require("../middleware/upload");
const { transcribeAudio } = require("../services/speech.service");

router.post("/transcribe", uploadAudio, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No audio file" });
    
    const text = await transcribeAudio(req.file.path);
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Transcription failed" });
  }
});

const { generate } = require("../controllers/ai.controller");

router.post("/ai", generate);

module.exports = router;