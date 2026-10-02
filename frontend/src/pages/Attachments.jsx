import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../services/api";

function Attachments() {
  const { id } = useParams();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [projects, setProjects] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const [selectedProject, setSelectedProject] = useState(id || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    project_id: id || "",
    name: "",
    url: "",
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
  // GET ATTACHMENTS
  // =========================

  const fetchAttachments = async () => {
    if (!selectedProject) {
      setAttachments([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/attachments/project/${selectedProject}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch attachments");
      }

      setAttachments(data.attachments || data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ADD ATTACHMENT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.project_id) {
      setError("Please select a project.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Attachment name is required.");
      return;
    }

    if (!formData.url.trim()) {
      setError("Attachment URL is required.");
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_BASE_URL}/attachments`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          project_id: Number(formData.project_id),
          name: formData.name.trim(),
          url: formData.url.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add attachment");
      }

      setFormData({
        project_id: selectedProject || "",
        name: "",
        url: "",
      });

      fetchAttachments();
    } catch (error) {
      setError(error.message);
    }
  };

  // =========================
  // DELETE ATTACHMENT
  // =========================

  const deleteAttachment = async (attachmentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this attachment?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/attachments/${attachmentId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete attachment");
      }

      fetchAttachments();
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
  // LOAD ATTACHMENTS
  // =========================

  useEffect(() => {
    if (selectedProject) {
      fetchAttachments();
    }
  }, [selectedProject]);

  // =========================
  // PROJECT CHANGE
  // =========================

  const handleProjectChange = (e) => {
    const projectId = e.target.value;

    setSelectedProject(projectId);

    setFormData({
      project_id: projectId,
      name: "",
      url: "",
    });
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="attachments-page">
      <div className="page-header">
        <div>
          <h1>Attachments</h1>

          <p>Manage project files and external resources.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* PROJECT SELECTOR */}

      <div className="attachment-project-selector">
        <label>Select Project</label>

        <select value={selectedProject} onChange={handleProjectChange}>
          <option value="">Select a project</option>

          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
      </div>

      {/* ADD ATTACHMENT */}

      {selectedProject &&
        (user.role === "freelancer" || user.role === "admin") && (
          <div className="attachment-form-card">
            <h2>Add Attachment</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>

                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    placeholder="Project document"
                  />
                </div>

                <div className="form-group">
                  <label>URL</label>

                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        url: e.target.value,
                      })
                    }
                    placeholder="https://example.com/file"
                  />
                </div>
              </div>

              <button type="submit" className="primary-button">
                Add Attachment
              </button>
            </form>
          </div>
        )}

      {/* ATTACHMENT LIST */}

      <div className="attachment-list-card">
        <div className="table-header">
          <h2>Project Attachments</h2>

          <span>
            {attachments.length} attachment
            {attachments.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <p className="loading-message">Loading attachments...</p>
        ) : attachments.length === 0 ? (
          <p className="empty-state">No attachments found.</p>
        ) : (
          <div className="attachment-list">
            {attachments.map((attachment) => (
              <div className="attachment-item" key={attachment.id}>
                <div className="attachment-info">
                  <h3>{attachment.name}</h3>

                  <p>{attachment.url}</p>
                </div>

                <div className="attachment-actions">
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="secondary-button"
                  >
                    Open
                  </a>

                  {(user.role === "freelancer" || user.role === "admin") && (
                    <button
                      className="delete-button"
                      onClick={() => deleteAttachment(attachment.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Attachments;
