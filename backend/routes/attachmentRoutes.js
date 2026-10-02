const express = require("express");

const router = express.Router();

const {
  createAttachment,
  getAttachmentsByProject,
  deleteAttachment,
} = require("../controllers/AttachmentController");

router.post("/", createAttachment);

router.get("/project/:projectId", getAttachmentsByProject);

router.delete("/:id", deleteAttachment);

module.exports = router;
