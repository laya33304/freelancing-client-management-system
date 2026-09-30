const db = require("../config/database");

// Create a new client
const createClient = (req, res) => {
  const { name, email, phone, company, address } = req.body;

  // Basic validation
  if (!name || !email) {
    return res.status(400).json({
      message: "Name and email are required",
    });
  }

  try {
    // Check whether client already exists
    const existingClient = db
      .prepare("SELECT id FROM clients WHERE email = ?")
      .get(email);

    if (existingClient) {
      return res.status(409).json({
        message: "Client already exists",
      });
    }

    // Insert client
    const result = db
      .prepare(
        `
                INSERT INTO clients
                (name, email, phone, company, address)
                VALUES (?, ?, ?, ?, ?)
            `,
      )
      .run(name, email, phone || null, company || null, address || null);

    // Get newly created client
    const client = db
      .prepare("SELECT * FROM clients WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json({
      message: "Client created successfully",
      client,
    });
  } catch (error) {
    console.error("Create client error:", error);

    res.status(500).json({
      message: "Failed to create client",
    });
  }
};

// Get all clients
const getClients = (req, res) => {
  try {
    const clients = db.prepare("SELECT * FROM clients ORDER BY id DESC").all();

    res.status(200).json({
      clients,
    });
  } catch (error) {
    console.error("Get clients error:", error);

    res.status(500).json({
      message: "Failed to get clients",
    });
  }
};

// Get one client
const getClientById = (req, res) => {
  const { id } = req.params;

  try {
    const client = db.prepare("SELECT * FROM clients WHERE id = ?").get(id);

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    res.status(200).json({
      client,
    });
  } catch (error) {
    console.error("Get client error:", error);

    res.status(500).json({
      message: "Failed to get client",
    });
  }
};

// Update client
const updateClient = (req, res) => {
  const { id } = req.params;

  const { name, email, phone, company, address } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      message: "Name and email are required",
    });
  }

  try {
    const existingClient = db
      .prepare("SELECT id FROM clients WHERE id = ?")
      .get(id);

    if (!existingClient) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    db.prepare(
      `
            UPDATE clients
            SET
                name = ?,
                email = ?,
                phone = ?,
                company = ?,
                address = ?
            WHERE id = ?
        `,
    ).run(name, email, phone || null, company || null, address || null, id);

    const updatedClient = db
      .prepare("SELECT * FROM clients WHERE id = ?")
      .get(id);

    res.status(200).json({
      message: "Client updated successfully",
      client: updatedClient,
    });
  } catch (error) {
    console.error("Update client error:", error);

    res.status(500).json({
      message: "Failed to update client",
    });
  }
};

// Delete client
const deleteClient = (req, res) => {
  const { id } = req.params;

  try {
    const existingClient = db
      .prepare("SELECT id FROM clients WHERE id = ?")
      .get(id);

    if (!existingClient) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    db.prepare("DELETE FROM clients WHERE id = ?").run(id);

    res.status(200).json({
      message: "Client deleted successfully",
    });
  } catch (error) {
    console.error("Delete client error:", error);

    res.status(500).json({
      message: "Failed to delete client",
    });
  }
};

module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
};
