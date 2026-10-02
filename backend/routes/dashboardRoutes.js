const express = require("express");

const router = express.Router();

const { getDashboardSummary } = require("../controllers/DashboardController");
const authMiddleware = require("../middleware/AuthMiddleware");
const allowRoles = require("../middleware/RoleMiddleware");

router.get(
  "/summary",
  authMiddleware,
  allowRoles("freelancer", "admin"),
  getDashboardSummary,
);

module.exports = router;
