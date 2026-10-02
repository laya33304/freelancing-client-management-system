const express = require("express");

const router = express.Router();

const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
} = require("../controllers/InvoiceController");

const authMiddleware = require("../middleware/AuthMiddleware");
const allowRoles = require("../middleware/RoleMiddleware");
const { invoiceAccess } = require("../middleware/ResourceMiddleware");

router.post(
  "/",
  authMiddleware,
  allowRoles("freelancer", "admin"),
  createInvoice,
);

router.get("/", authMiddleware, allowRoles("freelancer", "admin"), getInvoices);

router.get(
  "/:id",
  authMiddleware,
  allowRoles("freelancer","client", "admin"),
  invoiceAccess,
  getInvoiceById,
);

// router.put(
//   "/:id/status",
//   authMiddleware,
//   allowRoles("freelancer", "admin"),
//   updateInvoiceStatus,
// );

module.exports = router;
