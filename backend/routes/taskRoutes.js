const express = require("express");

const router = express.Router();

const {
  createTask,
  getTasksByProject,
  updateTaskStatus,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

// Create task
router.post("/", createTask);

// Get tasks for a project
router.get("/project/:projectId", getTasksByProject);

// Update task status
router.put("/:id/status", updateTaskStatus);

// Update task
router.put("/:id", updateTask);

// Delete task
router.delete("/:id", deleteTask);

module.exports = router;
