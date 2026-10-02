import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../services/api";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { token } = useAuth();

  const [project, setProject] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch project");
      }

      setProject(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProject();
    }
  }, [token, id]);

  if (loading) {
    return <div className="loading">Loading project...</div>;
  }

  if (error) {
    return (
      <div>
        <div className="error-message">{error}</div>

        <button
          className="primary-button"
          onClick={() => navigate("/projects")}
        >
          Back to Projects
        </button>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="project-details-page">
      <div className="page-header">
        <div>
          <button className="back-button" onClick={() => navigate("/projects")}>
            ← Back to Projects
          </button>

          <h1>{project.title}</h1>

          <p>Project details and management</p>
        </div>

        <span className={`status-badge ${project.status}`}>
          {project.status}
        </span>
      </div>

      <div className="project-details-grid">
        <div className="details-card">
          <h2>Project Information</h2>

          <div className="details-list">
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

            <div>
              <strong>Status</strong>

              <span>{project.status}</span>
            </div>

            <div>
              <strong>Created</strong>

              <span>{project.created_at}</span>
            </div>
          </div>
        </div>

        <div className="details-card">
          <h2>Description</h2>

          <p className="project-full-description">
            {project.description || "No description provided."}
          </p>
        </div>
      </div>

      <div className="project-modules">
        <div className="module-card">
          <h2>Tasks</h2>

          <p>Manage project tasks and progress.</p>

          <button onClick={() => navigate(`/projects/${id}/tasks`)}>
            View Tasks
          </button>
        </div>

        <div className="module-card">
          <h2>Invoices</h2>

          <p>Manage invoices for this project.</p>

          <button onClick={() => navigate(`/projects/${id}/invoices`)}>
            View Invoices
          </button>
        </div>

        <div className="module-card">
          <h2>Payments</h2>

          <p>Track payments for project invoices.</p>

          <button onClick={() => navigate(`/projects/${id}/payments`)}>
            View Payments
          </button>
        </div>

        <div className="module-card">
          <h2>Attachments</h2>

          <p>Manage project files and URLs.</p>

          <button onClick={() => navigate(`/projects/${id}/attachments`)}>
            View Attachments
          </button>
        </div>

        <div className="module-card">
          <h2>History</h2>

          <p>View the project activity history.</p>

          <button onClick={() => navigate(`/projects/${id}/history`)}>
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
