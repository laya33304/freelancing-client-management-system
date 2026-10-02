const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dbDir =
  process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, "../database");

// Ensure the directory exists so better-sqlite3 doesn't throw an error
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(__dirname, "../database/freelancer.db");

const db = new Database(dbPath);

// Enable foreign key constraints
db.pragma("foreign_keys = ON");

console.log("SQLite database connected");

module.exports = db;
