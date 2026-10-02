import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../services/api";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
};

const Clients = () => {
  const { token } = useAuth();

  const [clients, setClients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingClientId, setEditingClientId] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/clients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch clients");
      }

      setClients(
        Array.isArray(data)
          ? data
          : Array.isArray(data.clients)
            ? data.clients
            : [],
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");

      const url = editingClientId
        ? `${API_BASE_URL}/clients/${editingClientId}`
        : `${API_BASE_URL}/clients`;

      const method = editingClientId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${editingClientId ? "update" : "create"} client`,
        );
      }

      resetForm();

      fetchClients();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = (client) => {
    setEditingClientId(client.id);

    setFormData({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      company: client.company || "",
      address: client.address || "",
    });

    setShowForm(true);

    setError("");
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this client?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete client");
      }

      fetchClients();
    } catch (error) {
      setError(error.message);
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);

    setEditingClientId(null);

    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">Loading clients...</div>;
  }

  return (
    <div className="clients-page">
      <div className="page-header">
        <div>
          <h1>Clients</h1>

          <p>Manage your clients</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
        >
          {showForm ? "Cancel" : "Add Client"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="form-card">
          <h2>{editingClientId ? "Edit Client" : "Add Client"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div>
                <label>Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Phone</label>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Company</label>

                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>

              <div className="full-width">
                <label>Address</label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
            </div>

            <button type="submit" className="primary-button">
              {editingClientId ? "Update Client" : "Create Client"}
            </button>
          </form>
        </div>
      )}

      <div className="clients-table-card">
        <table>
          <thead>
            <tr>
              <th>Name</th>

              <th>Email</th>

              <th>Phone</th>

              <th>Company</th>

              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  No clients found.
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.name}</td>

                  <td>{client.email}</td>

                  <td>{client.phone || "-"}</td>

                  <td>{client.company || "-"}</td>

                  <td>
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(client)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => handleDelete(client.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Clients;
