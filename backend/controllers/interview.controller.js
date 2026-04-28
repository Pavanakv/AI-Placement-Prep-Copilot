const Interview = require("../models/Interview");

const saveInterview = async (req, res) => {
  try {
    const { role, level, focus, scores } = req.body;

    const averageScore = scores.length
      ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
      : 0;

    const interview = await Interview.create({
      userId: req.user._id,
      role,
      level,
      focus,
      scores,
      averageScore,
      totalQuestions: scores.length
    });

    res.status(201).json({ interview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ interviews });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { saveInterview, getInterviews };