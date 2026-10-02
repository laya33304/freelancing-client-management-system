const express = require("express");

const router = express.Router();

const { getDashboardSummary } = require("../controllers/DashboardController");

router.get("/summary", getDashboardSummary);

module.exports = router;
