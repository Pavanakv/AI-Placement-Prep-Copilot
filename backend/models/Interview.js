const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  role: { type: String },
  level: { type: String },
  focus: { type: String },
  scores: [{ type: Number }],
  averageScore: { type: Number },
  totalQuestions: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model("Interview", InterviewSchema);