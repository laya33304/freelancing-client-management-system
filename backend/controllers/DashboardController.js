const db = require("../config/database");

const getDashboardSummary = (req, res) => {
  try {
    let projectStats;
    let taskStats;
    let invoiceStats;
    let paymentStats;

    // ==========================================
    // ADMIN
    // ==========================================

    if (req.user.role === "admin") {
      projectStats = db
        .prepare(
          `
                SELECT
                    COUNT(*) AS total_projects,

                    SUM(
                        CASE
                            WHEN status = 'active'
                            THEN 1
                            ELSE 0
                        END
                    ) AS active_projects,

                    SUM(
                        CASE
                            WHEN status = 'completed'
                            THEN 1
                            ELSE 0
                        END
                    ) AS completed_projects,

                    SUM(
                        CASE
                            WHEN status = 'cancelled'
                            THEN 1
                            ELSE 0
                        END
                    ) AS cancelled_projects

                FROM projects
            `,
        )
        .get();

      taskStats = db
        .prepare(
          `
                SELECT
                    COUNT(*) AS total_tasks,

                    SUM(
                        CASE
                            WHEN status = 'To Do'
                            THEN 1
                            ELSE 0
                        END
                    ) AS todo_tasks,

                    SUM(
                        CASE
                            WHEN status = 'In Progress'
                            THEN 1
                            ELSE 0
                        END
                    ) AS in_progress_tasks,

                    SUM(
                        CASE
                            WHEN status = 'Completed'
                            THEN 1
                            ELSE 0
                        END
                    ) AS completed_tasks

                FROM tasks
            `,
        )
        .get();

      invoiceStats = db
        .prepare(
          `
                SELECT
                    COUNT(*) AS total_invoices,

                    COALESCE(
                        SUM(amount),
                        0
                    ) AS total_invoiced,

                    SUM(
                        CASE
                            WHEN status = 'Pending'
                            THEN 1
                            ELSE 0
                        END
                    ) AS pending_invoices,

                    SUM(
                        CASE
                            WHEN status = 'Partially Paid'
                            THEN 1
                            ELSE 0
                        END
                    ) AS partially_paid_invoices,

                    SUM(
                        CASE
                            WHEN status = 'Paid'
                            THEN 1
                            ELSE 0
                        END
                    ) AS paid_invoices

                FROM invoices
            `,
        )
        .get();

      paymentStats = db
        .prepare(
          `
                SELECT
                    COUNT(*) AS total_payments,

                    COALESCE(
                        SUM(amount),
                        0
                    ) AS total_earnings

                FROM payments
            `,
        )
        .get();
    }

    // ==========================================
    // FREELANCER
    // ==========================================
    else if (req.user.role === "freelancer") {
      projectStats = db
        .prepare(
          `
                SELECT
                    COUNT(*) AS total_projects,

                    SUM(
                        CASE
                            WHEN status = 'active'
                            THEN 1
                            ELSE 0
                        END
                    ) AS active_projects,

                    SUM(
                        CASE
                            WHEN status = 'completed'
                            THEN 1
                            ELSE 0
                        END
                    ) AS completed_projects,

                    SUM(
                        CASE
                            WHEN status = 'cancelled'
                            THEN 1
                            ELSE 0
                        END
                    ) AS cancelled_projects

                FROM projects

                WHERE freelancer_id = ?
            `,
        )
        .get(req.user.id);

      taskStats = db
        .prepare(
          `
                SELECT
                    COUNT(*) AS total_tasks,

                    SUM(
                        CASE
                            WHEN tasks.status = 'To Do'
                            THEN 1
                            ELSE 0
                        END
                    ) AS todo_tasks,

                    SUM(
                        CASE
                            WHEN tasks.status = 'In Progress'
                            THEN 1
                            ELSE 0
                        END
                    ) AS in_progress_tasks,

                    SUM(
                        CASE
                            WHEN tasks.status = 'Completed'
                            THEN 1
                            ELSE 0
                        END
                    ) AS completed_tasks

                FROM tasks

                JOIN projects
                    ON tasks.project_id = projects.id

                WHERE projects.freelancer_id = ?
            `,
        )
        .get(req.user.id);

      invoiceStats = db
        .prepare(
          `
                SELECT
                    COUNT(*) AS total_invoices,

                    COALESCE(
                        SUM(invoices.amount),
                        0
                    ) AS total_invoiced,

                    SUM(
                        CASE
                            WHEN invoices.status = 'Pending'
                            THEN 1
                            ELSE 0
                        END
                    ) AS pending_invoices,

                    SUM(
                        CASE
                            WHEN invoices.status = 'Partially Paid'
                            THEN 1
                            ELSE 0
                        END
                    ) AS partially_paid_invoices,

                    SUM(
                        CASE
                            WHEN invoices.status = 'Paid'
                            THEN 1
                            ELSE 0
                        END
                    ) AS paid_invoices

                FROM invoices

                JOIN projects
                    ON invoices.project_id = projects.id

                WHERE projects.freelancer_id = ?
            `,
        )
        .get(req.user.id);

      paymentStats = db
        .prepare(
          `
                SELECT
                    COUNT(*) AS total_payments,

                    COALESCE(
                        SUM(payments.amount),
                        0
                    ) AS total_earnings

                FROM payments

                JOIN invoices
                    ON payments.invoice_id = invoices.id

                JOIN projects
                    ON invoices.project_id = projects.id

                WHERE projects.freelancer_id = ?
            `,
        )
        .get(req.user.id);
    }

    // ==========================================
    // CLIENT
    // ==========================================
    else if (req.user.role === "client") {
      projectStats = db
        .prepare(
          `
                SELECT
                    COUNT(*) AS total_projects,

                    SUM(
                        CASE
                            WHEN projects.status = 'active'
                            THEN 1
                            ELSE 0
                        END
                    ) AS active_projects,

                    SUM(
                        CASE
                            WHEN projects.status = 'completed'
                            THEN 1
                            ELSE 0
                        END
                    ) AS completed_projects,

                    SUM(
                        CASE
                            WHEN projects.status = 'cancelled'
                            THEN 1
                            ELSE 0
                        END
                    ) AS cancelled_projects

                FROM projects

                JOIN clients
                    ON projects.client_id = clients.id

                WHERE clients.user_id = ?
            `,
        )
        .get(req.user.id);

      taskStats = db
        .prepare(
          `
                SELECT
                    COUNT(*) AS total_tasks,

                    SUM(
                        CASE
                            WHEN tasks.status = 'To Do'
                            THEN 1
                            ELSE 0
                        END
                    ) AS todo_tasks,

                    SUM(
                        CASE
                            WHEN tasks.status = 'In Progress'
                            THEN 1
                            ELSE 0
                        END
                    ) AS in_progress_tasks,

                    SUM(
                        CASE
                            WHEN tasks.status = 'Completed'
                            THEN 1
                            ELSE 0
                        END
                    ) AS completed_tasks

                FROM tasks

                JOIN projects
                    ON tasks.project_id = projects.id

                JOIN clients
                    ON projects.client_id = clients.id

                WHERE clients.user_id = ?
            `,
        )
        .get(req.user.id);

      invoiceStats = db
        .prepare(
          `
                SELECT
                    COUNT(*) AS total_invoices,

                    COALESCE(
                        SUM(invoices.amount),
                        0
                    ) AS total_invoiced,

                    SUM(
                        CASE
                            WHEN invoices.status = 'Pending'
                            THEN 1
                            ELSE 0
                        END
                    ) AS pending_invoices,

                    SUM(
                        CASE
                            WHEN invoices.status = 'Partially Paid'
                            THEN 1
                            ELSE 0
                        END
                    ) AS partially_paid_invoices,

                    SUM(
                        CASE
                            WHEN invoices.status = 'Paid'
                            THEN 1
                            ELSE 0
                        END
                    ) AS paid_invoices

                FROM invoices

                JOIN projects
                    ON invoices.project_id = projects.id

                JOIN clients
                    ON projects.client_id = clients.id

                WHERE clients.user_id = ?
            `,
        )
        .get(req.user.id);

      paymentStats = db
        .prepare(
          `
                SELECT
                    COUNT(*) AS total_payments,

                    COALESCE(
                        SUM(payments.amount),
                        0
                    ) AS total_earnings

                FROM payments

                JOIN invoices
                    ON payments.invoice_id = invoices.id

                JOIN projects
                    ON invoices.project_id = projects.id

                JOIN clients
                    ON projects.client_id = clients.id

                WHERE clients.user_id = ?
            `,
        )
        .get(req.user.id);
    }

    return res.status(200).json({
      projects: projectStats,

      tasks: taskStats,

      invoices: invoiceStats,

      payments: paymentStats,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      message: "Failed to fetch dashboard summary",
    });
  }
};

module.exports = {
  getDashboardSummary,
};
