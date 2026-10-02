const db = require("../config/database");

const createPayment = (req, res) => {
  const { invoice_id, amount, payment_date } = req.body;

  // 1. Validate input
  if (!invoice_id || !amount || !payment_date) {
    return res.status(400).json({
      message: "Invoice ID, amount and payment date are required",
    });
  }

  if (amount <= 0) {
    return res.status(400).json({
      message: "Payment amount must be greater than 0",
    });
  }

  try {
    // 2. Check whether invoice exists
    const invoice = db
      .prepare(
        `
            SELECT *
            FROM invoices
            WHERE id = ?
        `,
      )
      .get(invoice_id);

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    // 3. Calculate how much has already been paid
    const paymentSummary = db
      .prepare(
        `
            SELECT COALESCE(SUM(amount), 0) AS total_paid
            FROM payments
            WHERE invoice_id = ?
        `,
      )
      .get(invoice_id);

    const alreadyPaid = paymentSummary.total_paid;

    // 4. Calculate remaining amount
    const remainingAmount = invoice.amount - alreadyPaid;

    // 5. Prevent overpayment
    if (amount > remainingAmount) {
      return res.status(400).json({
        message: "Payment amount exceeds remaining invoice amount",
        remaining_amount: remainingAmount,
      });
    }

    // 6. Insert payment
    const paymentResult = db
      .prepare(
        `
            INSERT INTO payments
            (
                invoice_id,
                amount,
                payment_date
            )
            VALUES (?, ?, ?)
        `,
      )
      .run(invoice_id, amount, payment_date);

    // 7. Calculate total paid after this payment
    const updatedSummary = db
      .prepare(
        `
            SELECT COALESCE(SUM(amount), 0) AS total_paid
            FROM payments
            WHERE invoice_id = ?
        `,
      )
      .get(invoice_id);

    const totalPaid = updatedSummary.total_paid;

    // 8. Determine invoice status
    let status;

    if (totalPaid === 0) {
      status = "Pending";
    } else if (totalPaid < invoice.amount) {
      status = "Partially Paid";
    } else {
      status = "Paid";
    }

    // 9. Update invoice status
    db.prepare(
      `
            UPDATE invoices
            SET status = ?
            WHERE id = ?
        `,
    ).run(status, invoice_id);

    // 10. Add project history
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
      "PAYMENT_RECEIVED",
      `Payment of ${amount} received for invoice ${invoice.invoice_number}`,
    );

    // 11. Get updated invoice
    const updatedInvoice = db
      .prepare(
        `
            SELECT *
            FROM invoices
            WHERE id = ?
        `,
      )
      .get(invoice_id);

    // 12. Get created payment
    const payment = db
      .prepare(
        `
            SELECT *
            FROM payments
            WHERE id = ?
        `,
      )
      .get(paymentResult.lastInsertRowid);

    // 13. Send response
    return res.status(201).json({
      message: "Payment recorded successfully",
      payment: payment,
      invoice: updatedInvoice,
      total_paid: totalPaid,
      remaining_amount: invoice.amount - totalPaid,
    });
  } catch (error) {
    console.error("Create payment error:", error);

    return res.status(500).json({
      message: "Failed to create payment",
    });
  }
};

const getPaymentsByInvoice = (req, res) => {
  const { invoiceId } = req.params;

  try {
    // 1. Check invoice exists
    const invoice = db
      .prepare(
        `
            SELECT *
            FROM invoices
            WHERE id = ?
        `,
      )
      .get(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    // 2. Get payments
    const payments = db
      .prepare(
        `
            SELECT *
            FROM payments
            WHERE invoice_id = ?
            ORDER BY id DESC
        `,
      )
      .all(invoiceId);

    // 3. Return payments
    return res.status(200).json({
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      invoice_amount: invoice.amount,
      invoice_status: invoice.status,
      payments: payments,
    });
  } catch (error) {
    console.error("Get payments error:", error);

    return res.status(500).json({
      message: "Failed to fetch payments",
    });
  }
};

module.exports = {
  createPayment,
  getPaymentsByInvoice,
};
