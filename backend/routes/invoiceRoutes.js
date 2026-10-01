const express = require("express");

const router = express.Router();

const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
} = require("../controllers/InvoiceController");

router.post("/", createInvoice);

router.get("/", getInvoices);

router.get("/:id", getInvoiceById);

router.put("/:id/status", updateInvoiceStatus);

module.exports = router;
