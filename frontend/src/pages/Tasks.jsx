import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../services/api";

function Tasks() {
  const { id } = useParams();

  const token = localStorage.getItem("token");

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(id || "");

  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
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

      // If coming from /projects/:id/tasks
      // automatically select that project
      if (id) {
        setSelectedProject(String(id));
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // =========================
  // GET TASKS
  // =========================

  const fetchTasks = async () => {
    if (!selectedProject) {
      setTasks([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/tasks/project/${selectedProject}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch tasks");
      }

      setTasks(data.tasks || data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CREATE TASK
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProject) {
      setError("Please select a project.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          project_id: Number(selectedProject),
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          due_date: formData.due_date || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create task");
      }

      setFormData({
        title: "",
        description: "",
        priority: "Medium",
        due_date: "",
      });

      fetchTasks();
    } catch (error) {
      setError(error.message);
    }
  };

  // =========================
  // UPDATE TASK STATUS
  // =========================

  const updateTaskStatus = async (taskId, status) => {
    try {
      setError("");

      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update task status");
      }

      fetchTasks();
    } catch (error) {
      setError(error.message);
    }
  };

  // =========================
  // DELETE TASK
  // =========================

  const deleteTask = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete task");
      }

      fetchTasks();
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
  // LOAD TASKS WHEN PROJECT CHANGES
  // =========================

  useEffect(() => {
    if (selectedProject) {
      fetchTasks();
    }
  }, [selectedProject]);

  // =========================
  // FILTER TASKS
  // =========================

  const todoTasks = tasks.filter((task) => task.status === "To Do");

  const inProgressTasks = tasks.filter((task) => task.status === "In Progress");

  const completedTasks = tasks.filter((task) => task.status === "Completed");

  // =========================
  // TASK CARD
  // =========================

  const TaskCard = ({ task }) => {
    return (
      <div className="task-card">
        <div className="task-card-header">
          <h3>{task.title}</h3>

          <span className={`priority-badge ${task.priority?.toLowerCase()}`}>
            {task.priority}
          </span>
        </div>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        {task.due_date && <p className="task-due-date">Due: {task.due_date}</p>}

        <div className="task-actions">
          {task.status !== "To Do" && (
            <button onClick={() => updateTaskStatus(task.id, "To Do")}>
              To Do
            </button>
          )}

          {task.status !== "In Progress" && (
            <button onClick={() => updateTaskStatus(task.id, "In Progress")}>
              In Progress
            </button>
          )}

          {task.status !== "Completed" && (
            <button onClick={() => updateTaskStatus(task.id, "Completed")}>
              Completed
            </button>
          )}

          <button className="delete-button" onClick={() => deleteTask(task.id)}>
            Delete
          </button>
        </div>
      </div>
    );
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="tasks-page">
      <div className="page-header">
        <div>
          <h1>Tasks</h1>

          <p>Manage project tasks and track progress.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* PROJECT SELECTOR */}

      <div className="task-project-selector">
        <label>Select Project</label>

        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">Select a project</option>

          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
      </div>

      {/* CREATE TASK */}

      {selectedProject && (
        <div className="task-form-card">
          <h2>Create New Task</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Task Title</label>

                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter task title"
                />
              </div>

              <div className="form-group">
                <label>Priority</label>

                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value,
                    })
                  }
                >
                  <option value="Low">Low</option>

                  <option value="Medium">Medium</option>

                  <option value="High">High</option>
                </select>
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

            <div className="form-group">
              <label>Description</label>

              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                placeholder="Describe the task..."
                rows="3"
              />
            </div>

            <button type="submit" className="primary-button">
              Create Task
            </button>
          </form>
        </div>
      )}

      {/* KANBAN BOARD */}

      {selectedProject && (
        <div className="kanban-board">
          {/* TO DO */}

          <div className="kanban-column">
            <div className="kanban-column-header">
              <h2>To Do</h2>

              <span>{todoTasks.length}</span>
            </div>

            {loading ? (
              <p>Loading tasks...</p>
            ) : todoTasks.length === 0 ? (
              <p className="empty-state">No tasks</p>
            ) : (
              todoTasks.map((task) => <TaskCard key={task.id} task={task} />)
            )}
          </div>

          {/* IN PROGRESS */}

          <div className="kanban-column">
            <div className="kanban-column-header">
              <h2>In Progress</h2>

              <span>{inProgressTasks.length}</span>
            </div>

            {loading ? (
              <p>Loading tasks...</p>
            ) : inProgressTasks.length === 0 ? (
              <p className="empty-state">No tasks</p>
            ) : (
              inProgressTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </div>

          {/* COMPLETED */}

          <div className="kanban-column">
            <div className="kanban-column-header">
              <h2>Completed</h2>

              <span>{completedTasks.length}</span>
            </div>

            {loading ? (
              <p>Loading tasks...</p>
            ) : completedTasks.length === 0 ? (
              <p className="empty-state">No tasks</p>
            ) : (
              completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;
