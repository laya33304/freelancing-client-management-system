const db = require("../config/database");

const createAttachment = (req, res) => {
  const { project_id, name, url } = req.body;

  // Validate input
  if (!project_id || !name || !url) {
    return res.status(400).json({
      message: "Project ID, name and URL are required",
    });
  }

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
      .get(project_id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Insert attachment
    const result = db
      .prepare(
        `
            INSERT INTO attachments
            (
                project_id,
                name,
                url
            )
            VALUES (?, ?, ?)
        `,
      )
      .run(project_id, name, url);

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
    ).run(
      project_id,
      "ATTACHMENT_ADDED",
      `Attachment "${name}" added to project`,
    );

    // Get created attachment
    const attachment = db
      .prepare(
        `
            SELECT *
            FROM attachments
            WHERE id = ?
        `,
      )
      .get(result.lastInsertRowid);

    return res.status(201).json({
      message: "Attachment added successfully",
      attachment: attachment,
    });
  } catch (error) {
    console.error("Create attachment error:", error);

    return res.status(500).json({
      message: "Failed to add attachment",
    });
  }
};

const getAttachmentsByProject = (req, res) => {
  const { projectId } = req.params;

  try {
    // Check project exists
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

    // Get attachments
    const attachments = db
      .prepare(
        `
            SELECT *
            FROM attachments
            WHERE project_id = ?
            ORDER BY id DESC
        `,
      )
      .all(projectId);

    return res.status(200).json({
      project_id: projectId,
      attachments: attachments,
    });
  } catch (error) {
    console.error("Get attachments error:", error);

    return res.status(500).json({
      message: "Failed to fetch attachments",
    });
  }
};

const deleteAttachment = (req, res) => {
  const { id } = req.params;

  try {
    // Find attachment
    const attachment = db
      .prepare(
        `
            SELECT *
            FROM attachments
            WHERE id = ?
        `,
      )
      .get(id);

    if (!attachment) {
      return res.status(404).json({
        message: "Attachment not found",
      });
    }

    // Delete attachment
    db.prepare(
      `
            DELETE FROM attachments
            WHERE id = ?
        `,
    ).run(id);

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
      attachment.project_id,
      "ATTACHMENT_DELETED",
      `Attachment "${attachment.name}" deleted`,
    );

    return res.status(200).json({
      message: "Attachment deleted successfully",
    });
  } catch (error) {
    console.error("Delete attachment error:", error);

    return res.status(500).json({
      message: "Failed to delete attachment",
    });
  }
};

module.exports = {
  createAttachment,
  getAttachmentsByProject,
  deleteAttachment,
};
