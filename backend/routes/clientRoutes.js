const express = require("express");

const router = express.Router();

const {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} = require("../controllers/ClientController");

const authMiddleware = require("../middleware/AuthMiddleware");
const allowRoles = require("../middleware/RoleMiddleware");

// POST /api/clients
router.post(
  "/",
  authMiddleware,
  allowRoles("freelancer", "admin"),
  createClient,
);

// GET /api/clients
router.get("/", authMiddleware, allowRoles("freelancer", "admin"), getClients);

// GET /api/clients/:id
router.get(
  "/:id",
  authMiddleware,
  allowRoles("freelancer", "admin"),
  getClientById,
);

// PUT /api/clients/:id
router.put(
  "/:id",
  authMiddleware,
  allowRoles("freelancer", "admin"),
  updateClient,
);

// DELETE /api/clients/:id
router.delete(
  "/:id",
  authMiddleware,
  allowRoles("freelancer", "admin"),
  deleteClient,
);

module.exports = router;
