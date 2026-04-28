const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: { type: String, required: true },
  done: { type: Boolean, default: false },
  category: {
    type: String,
    default: "General"
  },
  priority: {
    type: String,
    enum: ["High", "Medium", "Low"],
    default: "Medium"
  },
  dueDate: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("Task", TaskSchema);