const express = require("express");
const router = express.Router();
const { saveInterview, getInterviews } = require("../controllers/interview.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);
router.post("/", saveInterview);
router.get("/", getInterviews);

module.exports = router;