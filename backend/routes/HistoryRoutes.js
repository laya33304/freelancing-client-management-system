const express = require("express");

const router = express.Router();

const { getProjectHistory } = require("../controllers/HistoryController");
const authMiddleware = require("../middleware/AuthMiddleware");
const allowRoles = require("../middleware/RoleMiddleware");
const { projectAccess } = require("../middleware/ResourceMiddleware");

router.get(
  "/project/:projectId",
  authMiddleware,
  allowRoles("freelancer","client", "admin"),
  projectAccess,
  getProjectHistory,
);

module.exports = router;
