// services/speech.service.js
const { AssemblyAI } = require("assemblyai");

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

const transcribeAudio = async (audioFilePath) => {
  const transcript = await client.transcripts.transcribe({
    audio: audioFilePath,
    punctuate: true,
    speech_models: ["universal-2"],
  });
  return transcript.text;
};

module.exports = { transcribeAudio };