const express = require("express");

const router = express.Router();

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/ProjectController");
const authMiddleware = require("../middleware/AuthMiddleware");
const allowRoles = require("../middleware/RoleMiddleware");
const { projectAccess } = require("../middleware/ResourceMiddleware");

router.post(
  "/",
  authMiddleware,
  allowRoles("freelancer", "admin"),
  createProject,
);

router.get(
  "/",
  authMiddleware,
  allowRoles("freelancer", "client", "admin"),
  getProjects,
);

router.get(
  "/:id",
  authMiddleware,
  allowRoles("freelancer", "client", "admin"),
  projectAccess,
  getProjectById,
);

router.put(
  "/:id",
  authMiddleware,
  allowRoles("freelancer", "admin"),
  projectAccess,
  updateProject,
);

router.delete(
  "/:id",
  authMiddleware,
  allowRoles("freelancer", "admin"),
  projectAccess,
  deleteProject,
);

module.exports = router;
