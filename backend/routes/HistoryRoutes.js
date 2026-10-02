const express = require("express");

const router = express.Router();

const { getProjectHistory } = require("../controllers/HistoryController");

router.get("/project/:projectId", getProjectHistory);

module.exports = router;
