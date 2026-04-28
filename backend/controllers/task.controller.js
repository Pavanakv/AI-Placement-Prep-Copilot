const Task = require("../models/Task");

// get all tasks for logged in user
const getTasks = async (req, res) => {
  try {
    console.log("USER ID:", req.user._id); // ← add this
    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (err) {
    console.error("GET TASKS ERROR:", err.message); // ← add this
    res.status(500).json({ message: "Server error" });
  }
};

// add new task
const addTask = async (req, res) => {
  try {
    const { text, category, priority, dueDate } = req.body;

    if (!text) return res.status(400).json({ message: "Task text required" });

    const task = await Task.create({
      userId: req.user._id,
      text,
      category: category || "DSA",
      priority: priority || "Medium",
      dueDate: dueDate || null
    });

    res.status(201).json({ task });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// toggle done/undone
const toggleTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) return res.status(404).json({ message: "Task not found" });

    task.done = !task.done;
    await task.save();

    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// delete task
const deleteTask = async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = { getTasks, addTask, toggleTask, deleteTask };