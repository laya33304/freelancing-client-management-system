const db = require("../config/database");

// Create project
const createProject = (req, res) => {
  const { client_id, freelancer_id, title, description, budget, deadline } =
    req.body;

  // Basic validation
  if (
    !client_id ||
    !freelancer_id ||
    !title ||
    budget === undefined ||
    !deadline
  ) {
    return res.status(400).json({
      message:
        "client_id, freelancer_id, title, budget and deadline are required",
    });
  }

  // Budget validation
  if (Number(budget) < 0) {
    return res.status(400).json({
      message: "Budget cannot be negative",
    });
  }

  try {
    // Check client
    const client = db
      .prepare("SELECT id FROM clients WHERE id = ?")
      .get(client_id);

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    // Check freelancer
    const freelancer = db
      .prepare(
        `
                SELECT id
                FROM users
                WHERE id = ?
                AND role = 'freelancer'
            `,
      )
      .get(freelancer_id);

    if (!freelancer) {
      return res.status(404).json({
        message: "Freelancer not found",
      });
    }

    // Check duplicate project
    const existingProject = db
      .prepare(
        `
                SELECT id
                FROM projects
                WHERE client_id = ?
                AND title = ?
            `,
      )
      .get(client_id, title);

    if (existingProject) {
      return res.status(409).json({
        message: "A project with this title already exists for this client",
      });
    }

    // Create project
    const result = db
      .prepare(
        `
                INSERT INTO projects
                (
                    client_id,
                    freelancer_id,
                    title,
                    description,
                    budget,
                    deadline
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `,
      )
      .run(
        client_id,
        freelancer_id,
        title,
        description || null,
        Number(budget),
        deadline,
      );

    // Get created project
    const project = db
      .prepare(
        `
                SELECT *
                FROM projects
                WHERE id = ?
            `,
      )
      .get(result.lastInsertRowid);

    // Add project history
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
    ).run(project.id, "PROJECT_CREATED", `Project "${project.title}" created`);

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);

    res.status(500).json({
      message: "Failed to create project",
    });
  }
};

// Get all projects
const getProjects = (req, res) => {
  try {
    const projects = db
      .prepare(
        `
            SELECT
                projects.*,
                clients.name AS client_name,
                users.name AS freelancer_name
            FROM projects
            JOIN clients
                ON projects.client_id = clients.id
            JOIN users
                ON projects.freelancer_id = users.id
            ORDER BY projects.id DESC
        `,
      )
      .all();

    res.status(200).json({
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    res.status(500).json({
      message: "Failed to get projects",
    });
  }
};

// Get project by ID
const getProjectById = (req, res) => {
  const { id } = req.params;

  try {
    const project = db
      .prepare(
        `
            SELECT
                projects.*,
                clients.name AS client_name,
                users.name AS freelancer_name
            FROM projects
            JOIN clients
                ON projects.client_id = clients.id
            JOIN users
                ON projects.freelancer_id = users.id
            WHERE projects.id = ?
        `,
      )
      .get(id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.status(200).json({
      project,
    });
  } catch (error) {
    console.error("Get project error:", error);

    res.status(500).json({
      message: "Failed to get project",
    });
  }
};

// Update project
const updateProject = (req, res) => {
  const { id } = req.params;

  const { title, description, budget, deadline, status } = req.body;

  if (!title || budget === undefined || !deadline || !status) {
    return res.status(400).json({
      message: "title, budget, deadline and status are required",
    });
  }

  if (Number(budget) < 0) {
    return res.status(400).json({
      message: "Budget cannot be negative",
    });
  }

  const validStatuses = ["active", "completed", "cancelled"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid project status",
    });
  }

  try {
    const existingProject = db
      .prepare("SELECT * FROM projects WHERE id = ?")
      .get(id);

    if (!existingProject) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check duplicate title
    const duplicateProject = db
      .prepare(
        `
                SELECT id
                FROM projects
                WHERE client_id = ?
                AND title = ?
                AND id != ?
            `,
      )
      .get(existingProject.client_id, title, id);

    if (duplicateProject) {
      return res.status(409).json({
        message:
          "Another project with this title already exists for this client",
      });
    }

    db.prepare(
      `
            UPDATE projects
            SET
                title = ?,
                description = ?,
                budget = ?,
                deadline = ?,
                status = ?
            WHERE id = ?
        `,
    ).run(title, description || null, Number(budget), deadline, status, id);

    const updatedProject = db
      .prepare("SELECT * FROM projects WHERE id = ?")
      .get(id);

    res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Update project error:", error);

    res.status(500).json({
      message: "Failed to update project",
    });
  }
};

// Delete project
const deleteProject = (req, res) => {
  const { id } = req.params;

  try {
    const project = db.prepare("SELECT id FROM projects WHERE id = ?").get(id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    db.prepare(
      `
            DELETE FROM projects
            WHERE id = ?
        `,
    ).run(id);

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    res.status(500).json({
      message: "Failed to delete project",
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
