const express = require("express");

const router = express.Router();

const {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} = require("../controllers/ClientController");

// POST /api/clients
router.post("/", createClient);

// GET /api/clients
router.get("/", getClients);

// GET /api/clients/:id
router.get("/:id", getClientById);

// PUT /api/clients/:id
router.put("/:id", updateClient);

// DELETE /api/clients/:id
router.delete("/:id", deleteClient);

module.exports = router;
