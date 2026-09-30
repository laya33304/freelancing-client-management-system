const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "../database/freelancer.db");

const db = new Database(dbPath);

// Enable foreign key constraints
db.pragma("foreign_keys = ON");

console.log("SQLite database connected");

module.exports = db;
