const express = require("express");

const router = express.Router();

const {
  createAttachment,
  getAttachmentsByProject,
  deleteAttachment,
} = require("../controllers/AttachmentController");
const authMiddleware = require("../middleware/AuthMiddleware");
const allowRoles = require("../middleware/RoleMiddleware");
const {
  projectAccess,
  projectBodyAccess,
  attachmentAccess,
} = require("../middleware/ResourceMiddleware");

router.post(
  "/",
  authMiddleware,
  allowRoles("freelancer", "admin"),
  projectBodyAccess,
  createAttachment,
);

router.get(
  "/project/:projectId",
  authMiddleware,
  allowRoles("freelancer", "client", "admin"),
  projectAccess,
  getAttachmentsByProject,
);

router.delete(
  "/:id",
  authMiddleware,
  allowRoles("freelancer", "admin"),
  attachmentAccess,
  deleteAttachment,
);

module.exports = router;
