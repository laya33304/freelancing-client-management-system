import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../services/api";

function Invoices() {
  const { id } = useParams();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [selectedProject, setSelectedProject] = useState(id || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    project_id: id || "",
    invoice_number: "",
    amount: "",
    issue_date: "",
    due_date: "",
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

        setFormData((previous) => ({
          ...previous,
          project_id: String(id),
        }));
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
      setLoading(true);
      setError("");

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

      // If a project was selected, only show
      // invoices belonging to that project.
      if (selectedProject) {
        const filteredInvoices = invoiceList.filter(
          (invoice) => String(invoice.project_id) === String(selectedProject),
        );

        setInvoices(filteredInvoices);
      } else {
        setInvoices(invoiceList);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CREATE INVOICE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.project_id) {
      setError("Please select a project.");
      return;
    }

    if (!formData.invoice_number.trim()) {
      setError("Invoice number is required.");
      return;
    }

    if (!formData.amount || Number(formData.amount) < 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!formData.issue_date || !formData.due_date) {
      setError("Issue date and due date are required.");
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_BASE_URL}/invoices`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          project_id: Number(formData.project_id),
          invoice_number: formData.invoice_number.trim(),
          amount: Number(formData.amount),
          issue_date: formData.issue_date,
          due_date: formData.due_date,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create invoice");
      }

      setFormData({
        project_id: selectedProject || "",
        invoice_number: "",
        amount: "",
        issue_date: "",
        due_date: "",
      });

      fetchInvoices();
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
  // PROJECT CHANGE
  // =========================

  const handleProjectChange = (e) => {
    const projectId = e.target.value;

    setSelectedProject(projectId);

    setFormData((previous) => ({
      ...previous,
      project_id: projectId,
    }));
  };

  // =========================
  // FORMAT STATUS
  // =========================

  const getStatusClass = (status) => {
    if (status === "Paid") {
      return "status-paid";
    }

    if (status === "Partially Paid") {
      return "status-partial";
    }

    return "status-pending";
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="invoices-page">
      <div className="page-header">
        <div>
          <h1>Invoices</h1>

          <p>Manage invoices and track payment status.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* PROJECT SELECTOR */}

      <div className="invoice-project-selector">
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

      {/* CREATE INVOICE */}

      {(user.role === "freelancer" || user.role === "admin") && (
        <div className="invoice-form-card">
          <h2>Create Invoice</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Project</label>

                <select
                  value={formData.project_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      project_id: e.target.value,
                    })
                  }
                >
                  <option value="">Select project</option>

                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Invoice Number</label>

                <input
                  type="text"
                  value={formData.invoice_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      invoice_number: e.target.value,
                    })
                  }
                  placeholder="INV-2026-0002"
                />
              </div>

              <div className="form-group">
                <label>Amount</label>

                <input
                  type="number"
                  min="0"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: e.target.value,
                    })
                  }
                  placeholder="50000"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Issue Date</label>

                <input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      issue_date: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Due Date</label>

                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      due_date: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <button type="submit" className="primary-button">
              Create Invoice
            </button>
          </form>
        </div>
      )}

      {/* INVOICE TABLE */}

      <div className="invoice-table-card">
        <div className="table-header">
          <h2>Invoice List</h2>

          <span>
            {invoices.length} invoice
            {invoices.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <p className="loading-message">Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p className="empty-state">No invoices found.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>

                  <th>Project</th>

                  <th>Amount</th>

                  <th>Issue Date</th>

                  <th>Due Date</th>

                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <strong>{invoice.invoice_number}</strong>
                    </td>

                    <td>
                      {invoice.project_title ||
                        invoice.project_name ||
                        invoice.project_id}
                    </td>

                    <td>₹{Number(invoice.amount).toLocaleString("en-IN")}</td>

                    <td>{invoice.issue_date}</td>

                    <td>{invoice.due_date}</td>

                    <td>
                      <span
                        className={`invoice-status ${getStatusClass(
                          invoice.status,
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
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

export default Invoices;
