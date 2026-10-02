const express = require("express");

const router = express.Router();

const {
  createTask,
  getTasksByProject,
  updateTaskStatus,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const authMiddleware = require("../middleware/AuthMiddleware");
const allowRoles = require("../middleware/RoleMiddleware");
const {
  projectAccess,
  taskAccess,
} = require("../middleware/ResourceMiddleware");

// Create task
router.post("/", authMiddleware, allowRoles("freelancer", "admin"), createTask);

// Get tasks for a project
router.get(
  "/project/:projectId",
  authMiddleware,
  allowRoles("freelancer", "client", "admin"),
  projectAccess,
  getTasksByProject,
);

// Update task status
router.put(
  "/:id/status",
  authMiddleware,
  allowRoles("freelancer", "admin"),
  taskAccess,
  updateTaskStatus,
);

// Update task
router.put(
  "/:id",
  authMiddleware,
  allowRoles("freelancer", "admin"),
  taskAccess,
  updateTask,
);

// Delete task
router.delete(
  "/:id",
  authMiddleware,
  allowRoles("freelancer", "admin"),
  taskAccess,
  deleteTask,
);

module.exports = router;
