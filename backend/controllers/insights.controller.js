const { generateInsights } = require("../services/insights.service");

const getInsights = async (req, res) => {
  try {
    const insights = await generateInsights(req.user._id);
    res.json({ insights });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getInsights };