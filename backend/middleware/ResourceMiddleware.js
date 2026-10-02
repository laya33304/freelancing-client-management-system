const db = require("../config/database");

// Check whether the logged-in user can access a project
const projectAccess = (req, res, next) => {
  const projectId = req.params.id || req.params.projectId;

  try {
    const project = db
      .prepare(
        `
            SELECT
                projects.id,
                projects.client_id,
                projects.freelancer_id,
                clients.user_id AS client_user_id
            FROM projects
            JOIN clients
                ON projects.client_id = clients.id
            WHERE projects.id = ?
        `,
      )
      .get(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Admin can access everything
    if (req.user.role === "admin") {
      return next();
    }

    // Freelancer assigned to the project
    if (
      req.user.role === "freelancer" &&
      project.freelancer_id === req.user.id
    ) {
      return next();
    }

    // Client who owns the project
    if (req.user.role === "client" && project.client_user_id === req.user.id) {
      return next();
    }

    return res.status(403).json({
      message: "You do not have access to this project",
    });
  } catch (error) {
    console.error("Project access error:", error);

    return res.status(500).json({
      message: "Failed to verify project access",
    });
  }
};

// Check whether the logged-in user can access a task
const taskAccess = (req, res, next) => {
  const taskId = req.params.id;

  try {
    const task = db
      .prepare(
        `
            SELECT
                tasks.id,
                projects.client_id,
                projects.freelancer_id,
                clients.user_id AS client_user_id
            FROM tasks
            JOIN projects
                ON tasks.project_id = projects.id
            JOIN clients
                ON projects.client_id = clients.id
            WHERE tasks.id = ?
        `,
      )
      .get(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (req.user.role === "admin") {
      return next();
    }

    if (req.user.role === "freelancer" && task.freelancer_id === req.user.id) {
      return next();
    }

    if (req.user.role === "client" && task.client_user_id === req.user.id) {
      return next();
    }

    return res.status(403).json({
      message: "You do not have access to this task",
    });
  } catch (error) {
    console.error("Task access error:", error);

    return res.status(500).json({
      message: "Failed to verify task access",
    });
  }
};

// Check whether the logged-in user can access an invoice
const invoiceAccess = (req, res, next) => {
  const invoiceId = req.params.id || req.params.invoiceId;

  try {
    const invoice = db
      .prepare(
        `
            SELECT
                invoices.id,
                projects.client_id,
                projects.freelancer_id,
                clients.user_id AS client_user_id
            FROM invoices
            JOIN projects
                ON invoices.project_id = projects.id
            JOIN clients
                ON projects.client_id = clients.id
            WHERE invoices.id = ?
        `,
      )
      .get(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    if (req.user.role === "admin") {
      return next();
    }

    if (
      req.user.role === "freelancer" &&
      invoice.freelancer_id === req.user.id
    ) {
      return next();
    }

    if (req.user.role === "client" && invoice.client_user_id === req.user.id) {
      return next();
    }

    return res.status(403).json({
      message: "You do not have access to this invoice",
    });
  } catch (error) {
    console.error("Invoice access error:", error);

    return res.status(500).json({
      message: "Failed to verify invoice access",
    });
  }
};

// Check whether the logged-in user can access an attachment
const attachmentAccess = (req, res, next) => {
  const attachmentId = req.params.id;

  try {
    const attachment = db
      .prepare(
        `
            SELECT
                attachments.id,
                projects.client_id,
                projects.freelancer_id,
                clients.user_id AS client_user_id
            FROM attachments
            JOIN projects
                ON attachments.project_id = projects.id
            JOIN clients
                ON projects.client_id = clients.id
            WHERE attachments.id = ?
        `,
      )
      .get(attachmentId);

    if (!attachment) {
      return res.status(404).json({
        message: "Attachment not found",
      });
    }

    if (req.user.role === "admin") {
      return next();
    }

    if (
      req.user.role === "freelancer" &&
      attachment.freelancer_id === req.user.id
    ) {
      return next();
    }

    if (
      req.user.role === "client" &&
      attachment.client_user_id === req.user.id
    ) {
      return next();
    }

    return res.status(403).json({
      message: "You do not have access to this attachment",
    });
  } catch (error) {
    console.error("Attachment access error:", error);

    return res.status(500).json({
      message: "Failed to verify attachment access",
    });
  }
};

const projectBodyAccess = (req, res, next) => {
  const projectId = req.body.project_id;

  try {
    const project = db
      .prepare(
        `
            SELECT
                projects.id,
                projects.client_id,
                projects.freelancer_id,
                clients.user_id AS client_user_id
            FROM projects
            JOIN clients
                ON projects.client_id = clients.id
            WHERE projects.id = ?
        `,
      )
      .get(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (req.user.role === "admin") {
      return next();
    }

    if (
      req.user.role === "freelancer" &&
      project.freelancer_id === req.user.id
    ) {
      return next();
    }

    if (req.user.role === "client" && project.client_user_id === req.user.id) {
      return next();
    }

    return res.status(403).json({
      message: "You do not have access to this project",
    });
  } catch (error) {
    console.error("Project body access error:", error);

    return res.status(500).json({
      message: "Failed to verify project access",
    });
  }
};
module.exports = {
  projectAccess,
  projectBodyAccess,
  taskAccess,
  invoiceAccess,
  attachmentAccess,
};
