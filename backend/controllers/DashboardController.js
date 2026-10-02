const db = require("../config/database");

const getDashboardSummary = (req, res) => {
  try {
    // 1. Project statistics

    const projectStats = db
      .prepare(
        `
            SELECT
                COUNT(*) AS total_projects,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_projects,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_projects,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_projects
            FROM projects
        `,
      )
      .get();

    // 2. Task statistics

    const taskStats = db
      .prepare(
        `
            SELECT
                COUNT(*) AS total_tasks,
                SUM(CASE WHEN status = 'To Do' THEN 1 ELSE 0 END) AS todo_tasks,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_tasks,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed_tasks
            FROM tasks
        `,
      )
      .get();

    // 3. Invoice statistics

    const invoiceStats = db
      .prepare(
        `
            SELECT
                COUNT(*) AS total_invoices,
                COALESCE(SUM(amount), 0) AS total_invoiced,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_invoices,
                SUM(CASE WHEN status = 'Partially Paid' THEN 1 ELSE 0 END) AS partially_paid_invoices,
                SUM(CASE WHEN status = 'Paid' THEN 1 ELSE 0 END) AS paid_invoices
            FROM invoices
        `,
      )
      .get();

    // 4. Payment / earnings statistics

    const paymentStats = db
      .prepare(
        `
            SELECT
                COUNT(*) AS total_payments,
                COALESCE(SUM(amount), 0) AS total_earnings
            FROM payments
        `,
      )
      .get();

    // 5. Send dashboard response

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
