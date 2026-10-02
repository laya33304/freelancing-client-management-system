const express = require("express");

const router = express.Router();

const {
  createPayment,
  getPaymentsByInvoice,
} = require("../controllers/PaymentController");
const authMiddleware = require("../middleware/AuthMiddleware");
const allowRoles = require("../middleware/RoleMiddleware");
const { invoiceAccess } = require("../middleware/ResourceMiddleware");
router.post(
  "/",
  authMiddleware,
  allowRoles("freelancer", "admin"),
  createPayment,
);

router.get(
  "/invoice/:invoiceId",
  authMiddleware,
  allowRoles("freelancer","client", "admin"),
  invoiceAccess,
  getPaymentsByInvoice,
);

module.exports = router;
