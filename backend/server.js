require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const aiRoutes = require("./routes/ai.routes");
const taskRoutes = require("./routes/task.routes");
const interviewRoutes = require("./routes/interview.routes");
const insightsRoutes = require("./routes/insights.routes");

const app = express();
connectDB();

app.use(cors({
  origin: "https://ai-placement-prep-copilot.vercel.app",
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api", aiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
