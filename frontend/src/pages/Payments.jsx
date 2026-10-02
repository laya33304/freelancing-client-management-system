import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../services/api";

function Payments() {
  const { id } = useParams();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);

  const [selectedProject, setSelectedProject] = useState(id || "");
  const [selectedInvoice, setSelectedInvoice] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    invoice_id: "",
    amount: "",
    payment_date: "",
  });

  // =========================
  // GET PROJECTS
  // =========================

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch projects");
      }

      const projectList = data.projects || data;

      setProjects(projectList);

      if (id) {
        setSelectedProject(String(id));
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // =========================
  // GET INVOICES
  // =========================

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch invoices");
      }

      const invoiceList = data.invoices || data;

      let filteredInvoices = invoiceList;

      if (selectedProject) {
        filteredInvoices = invoiceList.filter(
          (invoice) => String(invoice.project_id) === String(selectedProject),
        );
      }

      setInvoices(filteredInvoices);
    } catch (error) {
      setError(error.message);
    }
  };

  // =========================
  // GET PAYMENTS
  // =========================

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      let paymentList = [];

      /*
       * Backend currently provides:
       * GET /payments/invoice/:invoiceId
       *
       * So we get payments for each visible invoice.
       */

      for (const invoice of invoices) {
        const response = await fetch(
          `${API_BASE_URL}/payments/invoice/${invoice.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch payments");
        }

        const invoicePayments = data.payments || data;

        const paymentsWithInvoice = invoicePayments.map((payment) => ({
          ...payment,
          invoice_number: invoice.invoice_number,
          project_id: invoice.project_id,
        }));

        paymentList = [...paymentList, ...paymentsWithInvoice];
      }

      setPayments(paymentList);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RECORD PAYMENT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.invoice_id) {
      setError("Please select an invoice.");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    if (!formData.payment_date) {
      setError("Payment date is required.");
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_BASE_URL}/payments`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          invoice_id: Number(formData.invoice_id),
          amount: Number(formData.amount),
          payment_date: formData.payment_date,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to record payment");
      }

      setFormData({
        invoice_id: selectedInvoice || "",
        amount: "",
        payment_date: "",
      });

      await fetchInvoices();
    } catch (error) {
      setError(error.message);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchProjects();
  }, [id]);

  // =========================
  // LOAD INVOICES
  // =========================

  useEffect(() => {
    fetchInvoices();
  }, [selectedProject]);

  // =========================
  // LOAD PAYMENTS
  // =========================

  useEffect(() => {
    if (invoices.length > 0) {
      fetchPayments();
    } else {
      setPayments([]);
    }
  }, [invoices]);

  // =========================
  // PROJECT CHANGE
  // =========================

  const handleProjectChange = (e) => {
    const projectId = e.target.value;

    setSelectedProject(projectId);

    setSelectedInvoice("");

    setFormData({
      invoice_id: "",
      amount: "",
      payment_date: "",
    });
  };

  // =========================
  // INVOICE CHANGE
  // =========================

  const handleInvoiceChange = (e) => {
    const invoiceId = e.target.value;

    setSelectedInvoice(invoiceId);

    setFormData({
      ...formData,
      invoice_id: invoiceId,
    });
  };

  // =========================
  // TOTAL RECEIVED
  // =========================

  const totalReceived = payments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0,
  );

  // =========================
  // UI
  // =========================

  return (
    <div className="payments-page">
      <div className="page-header">
        <div>
          <h1>Payments</h1>

          <p>Track payments received for project invoices.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* PROJECT SELECTOR */}

      <div className="payment-project-selector">
        <label>Select Project</label>

        <select value={selectedProject} onChange={handleProjectChange}>
          <option value="">All Projects</option>

          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
      </div>

      {/* SUMMARY */}

      <div className="payment-summary">
        <div className="payment-summary-card">
          <span>Total Payments</span>

          <strong>{payments.length}</strong>
        </div>

        <div className="payment-summary-card">
          <span>Total Received</span>

          <strong>₹{totalReceived.toLocaleString("en-IN")}</strong>
        </div>
      </div>

      {/* RECORD PAYMENT */}

      {(user.role === "freelancer" || user.role === "admin") && (
        <div className="payment-form-card">
          <h2>Record Payment</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Invoice</label>

                <select
                  value={formData.invoice_id}
                  onChange={handleInvoiceChange}
                >
                  <option value="">Select invoice</option>

                  {invoices.map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoice_number} - ₹
                      {Number(invoice.amount).toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Amount</label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: e.target.value,
                    })
                  }
                  placeholder="30000"
                />
              </div>

              <div className="form-group">
                <label>Payment Date</label>

                <input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payment_date: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <button type="submit" className="primary-button">
              Record Payment
            </button>
          </form>
        </div>
      )}

      {/* PAYMENT TABLE */}

      <div className="payment-table-card">
        <div className="table-header">
          <h2>Payment History</h2>

          <span>
            {payments.length} payment
            {payments.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <p className="loading-message">Loading payments...</p>
        ) : payments.length === 0 ? (
          <p className="empty-state">No payments found.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>

                  <th>Amount</th>

                  <th>Payment Date</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <strong>{payment.invoice_number}</strong>
                    </td>

                    <td>₹{Number(payment.amount).toLocaleString("en-IN")}</td>

                    <td>{payment.payment_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Payments;
