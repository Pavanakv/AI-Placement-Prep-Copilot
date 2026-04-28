require("dotenv").config(); // THIS MUST BE FIRST LINE
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

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api", aiRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});