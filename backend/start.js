const fs = require("fs");
const path = require("path");

const Database = require("better-sqlite3");

const dbPath =
  process.env.DB_PATH || path.join(__dirname, "database/freelancer.db");

const dbDirectory = path.dirname(dbPath);

// Make sure the directory exists
fs.mkdirSync(dbDirectory, {
  recursive: true,
});

const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

const schemaPath = path.join(__dirname, "database/schema.sql");
const seedPath = path.join(__dirname, "database/seed.sql");

const schema = fs.readFileSync(schemaPath, "utf8");
const seed = fs.readFileSync(seedPath, "utf8");

try {
  console.log("Initializing SQLite database...");

  db.exec(schema);

  console.log("Database tables ready.");

  db.exec(seed);

  console.log("Seed data ready.");
} catch (error) {
  console.error("Database initialization failed:");
  console.error(error);

  process.exit(1);
}

db.close();

console.log("Starting Express server...");

require("./server");
