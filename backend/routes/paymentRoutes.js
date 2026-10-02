const express = require("express");

const router = express.Router();

const {
  createPayment,
  getPaymentsByInvoice,
} = require("../controllers/PaymentController");

router.post("/", createPayment);

router.get("/invoice/:invoiceId", getPaymentsByInvoice);

module.exports = router;
