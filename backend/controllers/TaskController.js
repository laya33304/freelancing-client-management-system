const db = require("../config/database");

// Create a task
const createTask = (req, res) => {
  const { project_id, title, description, priority, due_date } = req.body;

  if (!project_id || !title) {
    return res.status(400).json({
      message: "project_id and title are required",
    });
  }

  const validPriorities = ["Low", "Medium", "High"];

  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({
      message: "Invalid priority",
    });
  }

  try {
    // Check project
    const project = db
      .prepare("SELECT id FROM projects WHERE id = ?")
      .get(project_id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Create task
    const result = db
      .prepare(
        `
                INSERT INTO tasks
                (
                    project_id,
                    title,
                    description,
                    priority,
                    due_date
                )
                VALUES (?, ?, ?, ?, ?)
            `,
      )
      .run(
        project_id,
        title,
        description || null,
        priority || "Medium",
        due_date || null,
      );

    // Get created task
    const task = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(result.lastInsertRowid);

    // Add history
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
    ).run(project_id, "TASK_CREATED", `Task "${title}" created`);

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Create task error:", error);

    res.status(500).json({
      message: "Failed to create task",
    });
  }
};

// Get tasks for a project
const getTasksByProject = (req, res) => {
  const { projectId } = req.params;

  try {
    const project = db
      .prepare("SELECT id FROM projects WHERE id = ?")
      .get(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const tasks = db
      .prepare(
        `
                SELECT *
                FROM tasks
                WHERE project_id = ?
                ORDER BY id DESC
            `,
      )
      .all(projectId);

    res.status(200).json({
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    res.status(500).json({
      message: "Failed to get tasks",
    });
  }
};

// Update task status
const updateTaskStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["To Do", "In Progress", "Completed"];

  if (!status) {
    return res.status(400).json({
      message: "Status is required",
    });
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid task status",
    });
  }

  try {
    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Update status
    db.prepare(
      `
            UPDATE tasks
            SET status = ?
            WHERE id = ?
        `,
    ).run(status, id);

    // Add history
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
      task.project_id,
      "TASK_STATUS_CHANGED",
      `Task "${task.title}" status changed from "${task.status}" to "${status}"`,
    );

    // Get updated task
    const updatedTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);

    res.status(200).json({
      message: "Task status updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task status error:", error);

    res.status(500).json({
      message: "Failed to update task status",
    });
  }
};

// Update complete task
const updateTask = (req, res) => {
  const { id } = req.params;

  const { title, description, priority, due_date } = req.body;

  if (!title) {
    return res.status(400).json({
      message: "Title is required",
    });
  }

  const validPriorities = ["Low", "Medium", "High"];

  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({
      message: "Invalid priority",
    });
  }

  try {
    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    db.prepare(
      `
            UPDATE tasks
            SET
                title = ?,
                description = ?,
                priority = ?,
                due_date = ?
            WHERE id = ?
        `,
    ).run(
      title,
      description || null,
      priority || task.priority,
      due_date || null,
      id,
    );

    const updatedTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);

    res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);

    res.status(500).json({
      message: "Failed to update task",
    });
  }
};

// Delete task
const deleteTask = (req, res) => {
  const { id } = req.params;

  try {
    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    db.prepare(
      `
            DELETE FROM tasks
            WHERE id = ?
        `,
    ).run(id);

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    res.status(500).json({
      message: "Failed to delete task",
    });
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  updateTaskStatus,
  updateTask,
  deleteTask,
};
