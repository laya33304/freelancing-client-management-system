const db = require("../config/database");

// Generate invoice number
const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();

  const lastInvoice = db
    .prepare(
      `
            SELECT invoice_number
            FROM invoices
            ORDER BY id DESC
            LIMIT 1
        `,
    )
    .get();

  let nextNumber = 1;

  if (lastInvoice) {
    const parts = lastInvoice.invoice_number.split("-");

    if (parts.length === 3) {
      nextNumber = parseInt(parts[2]) + 1;
    }
  }

  return `INV-${year}-${String(nextNumber).padStart(4, "0")}`;
};

// Create invoice
const createInvoice = (req, res) => {
  const { project_id, amount, issue_date, due_date } = req.body;

  // Validation
  if (!project_id || amount === undefined || !issue_date) {
    return res.status(400).json({
      message: "project_id, amount and issue_date are required",
    });
  }

  if (Number(amount) <= 0) {
    return res.status(400).json({
      message: "Invoice amount must be greater than 0",
    });
  }

  try {
    // Check project
    const project = db
      .prepare(
        `
                SELECT *
                FROM projects
                WHERE id = ?
            `,
      )
      .get(project_id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber();

    // Create invoice
    const result = db
      .prepare(
        `
                INSERT INTO invoices
                (
                    project_id,
                    invoice_number,
                    amount,
                    issue_date,
                    due_date
                )
                VALUES (?, ?, ?, ?, ?)
            `,
      )
      .run(
        project_id,
        invoiceNumber,
        Number(amount),
        issue_date,
        due_date || null,
      );

    // Get created invoice
    const invoice = db
      .prepare(
        `
                SELECT *
                FROM invoices
                WHERE id = ?
            `,
      )
      .get(result.lastInsertRowid);

    // Add project history
    db.prepare(
      `
            INSERT INTO project_history
            (
                project_id,
                action,
                description
            )
            VALUES (?, ?, ?)
        `,
    ).run(
      project_id,
      "INVOICE_CREATED",
      `Invoice ${invoice.invoice_number} created`,
    );

    res.status(201).json({
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    console.error("Create invoice error:", error);

    res.status(500).json({
      message: "Failed to create invoice",
    });
  }
};

// Get all invoices
const getInvoices = (req, res) => {

    try {

        let invoices;

        // Admin sees all invoices
        if (req.user.role === "admin") {

            invoices = db.prepare(`
                SELECT
                    invoices.*,
                    projects.title AS project_title,
                    clients.name AS client_name,
                    users.name AS freelancer_name
                FROM invoices
                JOIN projects
                    ON invoices.project_id = projects.id
                JOIN clients
                    ON projects.client_id = clients.id
                JOIN users
                    ON projects.freelancer_id = users.id
                ORDER BY invoices.id DESC
            `).all();

        }

        // Freelancer sees invoices of their projects
        else if (req.user.role === "freelancer") {

            invoices = db.prepare(`
                SELECT
                    invoices.*,
                    projects.title AS project_title,
                    clients.name AS client_name,
                    users.name AS freelancer_name
                FROM invoices
                JOIN projects
                    ON invoices.project_id = projects.id
                JOIN clients
                    ON projects.client_id = clients.id
                JOIN users
                    ON projects.freelancer_id = users.id
                WHERE projects.freelancer_id = ?
                ORDER BY invoices.id DESC
            `).all(req.user.id);

        }

        // Client sees invoices of their projects
        else if (req.user.role === "client") {

            invoices = db.prepare(`
                SELECT
                    invoices.*,
                    projects.title AS project_title,
                    clients.name AS client_name,
                    users.name AS freelancer_name
                FROM invoices
                JOIN projects
                    ON invoices.project_id = projects.id
                JOIN clients
                    ON projects.client_id = clients.id
                JOIN users
                    ON projects.freelancer_id = users.id
                WHERE clients.user_id = ?
                ORDER BY invoices.id DESC
            `).all(req.user.id);

        }

        return res.status(200).json({
            invoices: invoices
        });

    } catch (error) {

        console.error("Get invoices error:", error);

        return res.status(500).json({
            message: "Failed to fetch invoices"
        });
    }
};

// Get invoice by ID
const getInvoiceById = (req, res) => {
  const { id } = req.params;

  try {
    const invoice = db
      .prepare(
        `
                SELECT
                    invoices.*,
                    projects.title AS project_title
                FROM invoices
                JOIN projects
                    ON invoices.project_id = projects.id
                WHERE invoices.id = ?
            `,
      )
      .get(id);

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      invoice,
    });
  } catch (error) {
    console.error("Get invoice error:", error);

    res.status(500).json({
      message: "Failed to get invoice",
    });
  }
};

// Update invoice status
const updateInvoiceStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["Pending", "Partially Paid", "Paid"];

  if (!status) {
    return res.status(400).json({
      message: "Status is required",
    });
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid invoice status",
    });
  }

  try {
    const invoice = db
      .prepare(
        `
                SELECT *
                FROM invoices
                WHERE id = ?
            `,
      )
      .get(id);

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    db.prepare(
      `
            UPDATE invoices
            SET status = ?
            WHERE id = ?
        `,
    ).run(status, id);

    const updatedInvoice = db
      .prepare(
        `
                SELECT *
                FROM invoices
                WHERE id = ?
            `,
      )
      .get(id);

    // Add history
    db.prepare(
      `
            INSERT INTO project_history
            (
                project_id,
                action,
                description
            )
            VALUES (?, ?, ?)
        `,
    ).run(
      invoice.project_id,
      "INVOICE_STATUS_CHANGED",
      `Invoice ${invoice.invoice_number} status changed from "${invoice.status}" to "${status}"`,
    );

    res.status(200).json({
      message: "Invoice status updated successfully",
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error("Update invoice status error:", error);

    res.status(500).json({
      message: "Failed to update invoice status",
    });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
};
