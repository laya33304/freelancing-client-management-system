const fs = require("fs");
const path = require("path");

const db = require("../config/database");

const schemaPath = path.join(__dirname, "schema.sql");
const seedPath = path.join(__dirname, "seed.sql");

const schema = fs.readFileSync(schemaPath, "utf-8");
const seed = fs.readFileSync(seedPath, "utf-8");

try {
  console.log("Creating database tables...");

  db.exec(schema);

  console.log("Tables created successfully.");

  console.log("Inserting seed data...");

  db.exec(seed);

  console.log("Seed data inserted successfully.");
} catch (error) {
  console.error("Database initialization failed:");
  console.error(error);
} finally {
  db.close();

  console.log("Database connection closed.");
}
