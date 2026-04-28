const express = require("express");
const router = express.Router();
const { getTasks, addTask, toggleTask, deleteTask } = require("../controllers/task.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/", getTasks);
router.post("/", addTask);
router.patch("/:id/toggle", toggleTask);
router.delete("/:id", deleteTask);
router.delete("/", async (req, res) => {
  try {
    await Task.deleteMany({ userId: req.user._id });
    res.json({ message: "All tasks deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;