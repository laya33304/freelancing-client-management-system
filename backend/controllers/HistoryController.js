const db = require("../config/database");

const getProjectHistory = (req, res) => {
  const { projectId } = req.params;

  try {
    // Check whether project exists
    const project = db
      .prepare(
        `
            SELECT *
            FROM projects
            WHERE id = ?
        `,
      )
      .get(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Get project history
    const history = db
      .prepare(
        `
            SELECT *
            FROM project_history
            WHERE project_id = ?
            ORDER BY id DESC
        `,
      )
      .all(projectId);

    return res.status(200).json({
      project_id: projectId,
      history: history,
    });
  } catch (error) {
    console.error("Get project history error:", error);

    return res.status(500).json({
      message: "Failed to fetch project history",
    });
  }
};

module.exports = {
  getProjectHistory,
};
