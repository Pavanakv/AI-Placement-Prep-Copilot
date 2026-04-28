const { generateAIResponse } = require("../services/ai.service");

const generate = async (req, res) => {
  const { type, input, messages } = req.body;

  if (
    type !== "interview" &&
    (!input || !input.trim())
  ) {
    return res.json({ result: "Please provide valid input" });
  }
  const result = await generateAIResponse(type, input, messages);

  res.json({ result });
};

module.exports = { generate };