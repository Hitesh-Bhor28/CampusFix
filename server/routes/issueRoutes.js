const express = require("express");
const router = express.Router();
const { getAssignedTasks, updateTaskStatus } = require("../controllers/issueController");

router.get("/tasks", getAssignedTasks);
router.patch("/:id/status", updateTaskStatus);

module.exports = router;
