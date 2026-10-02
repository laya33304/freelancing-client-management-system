import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/api";

const emptyForm = {
  client_id: "",
  title: "",
  description: "",
  budget: "",
  deadline: "",
};

const Projects = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState(emptyForm);

  const fetchProjects = async () => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch projects");
    }

    setProjects(
      Array.isArray(data)
        ? data
        : Array.isArray(data.projects)
          ? data.projects
          : [],
    );
  };

  const fetchClients = async () => {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch clients");
    }

    setClients(data);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([fetchProjects(), fetchClients()]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          ...formData,
          client_id: Number(formData.client_id),
          budget: Number(formData.budget),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create project");
      }

      setFormData(emptyForm);

      setShowForm(false);

      fetchProjects();
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading projects...</div>;
  }

  return (
    <div className="projects-page">
      <div className="page-header">
        <div>
          <h1>Projects</h1>

          <p>Manage your client projects</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setShowForm(!showForm);
            setError("");
          }}
        >
          {showForm ? "Cancel" : "Create Project"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="form-card">
          <h2>Create Project</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div>
                <label>Client</label>

                <select
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select client</option>

                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Project Title</label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="full-width">
                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                />
              </div>

              <div>
                <label>Budget</label>

                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

              <div>
                <label>Deadline</label>

                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="primary-button">
              Create Project
            </button>
          </form>
        </div>
      )}

      <div className="project-grid">
        {projects.length === 0 ? (
          <div className="empty-state">No projects found.</div>
        ) : (
          projects.map((project) => (
            <div
              className="project-card"
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="project-card-header">
                <h2>{project.title}</h2>

                <span className={`status-badge ${project.status}`}>
                  {project.status}
                </span>
              </div>

              <p className="project-description">
                {project.description || "No description provided."}
              </p>

              <div className="project-info">
                <div>
                  <strong>Client</strong>

                  <span>{project.client_name || project.client_id}</span>
                </div>

                <div>
                  <strong>Budget</strong>

                  <span>₹{project.budget}</span>
                </div>

                <div>
                  <strong>Deadline</strong>

                  <span>{project.deadline}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Projects;
