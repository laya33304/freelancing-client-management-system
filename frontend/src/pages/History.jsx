import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../services/api";

function History() {
  const { id } = useParams();

  const token = localStorage.getItem("token");

  const [projects, setProjects] = useState([]);
  const [history, setHistory] = useState([]);

  const [selectedProject, setSelectedProject] = useState(id || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      // Automatically select project
      // when coming from /projects/:id/history
      if (id) {
        setSelectedProject(String(id));
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // =========================
  // GET HISTORY
  // =========================

  const fetchHistory = async () => {
    if (!selectedProject) {
      setHistory([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/history/project/${selectedProject}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch project history");
      }

      setHistory(data.history || data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchProjects();
  }, [id]);

  // =========================
  // LOAD HISTORY
  // =========================

  useEffect(() => {
    if (selectedProject) {
      fetchHistory();
    }
  }, [selectedProject]);

  // =========================
  // PROJECT CHANGE
  // =========================

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
  };

  // =========================
  // FORMAT ACTION
  // =========================

  const formatAction = (action) => {
    if (!action) {
      return "";
    }

    return action
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="history-page">
      <div className="page-header">
        <div>
          <h1>Project History</h1>

          <p>Track important activities and changes made to a project.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* PROJECT SELECTOR */}

      <div className="history-project-selector">
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

      {/* HISTORY */}

      <div className="history-card">
        <div className="table-header">
          <h2>Activity Timeline</h2>

          <span>
            {history.length} event
            {history.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <p className="loading-message">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="empty-state">No history available for this project.</p>
        ) : (
          <div className="history-timeline">
            {history.map((item) => (
              <div className="history-item" key={item.id}>
                <div className="history-dot">
                  <span></span>
                </div>

                <div className="history-content">
                  <div className="history-item-header">
                    <h3>{formatAction(item.action)}</h3>

                    <span className="history-date">
                      {formatDate(item.created_at)}
                    </span>
                  </div>

                  {item.description && <p>{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
