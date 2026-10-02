const db = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate input
  if (!name || !email || !password || !role) {
    return res.status(400).json({
      message: "Name, email, password and role are required",
    });
  }

  // Validate role
  const validRoles = ["freelancer", "client", "admin"];

  if (!validRoles.includes(role)) {
    return res.status(400).json({
      message: "Invalid role",
    });
  }

  try {
    // Check whether email already exists
    const existingUser = db
      .prepare(
        `
            SELECT *
            FROM users
            WHERE email = ?
        `,
      )
      .get(email);

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = db
      .prepare(
        `
            INSERT INTO users
            (
                name,
                email,
                password,
                role
            )
            VALUES (?, ?, ?, ?)
        `,
      )
      .run(name, email, hashedPassword, role);

    // Get created user
    const user = db
      .prepare(
        `
            SELECT id, name, email, role, created_at
            FROM users
            WHERE id = ?
        `,
      )
      .get(result.lastInsertRowid);

    return res.status(201).json({
      message: "User registered successfully",
      user: user,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  try {
    // Find user
    const user = db
      .prepare(
        `
            SELECT *
            FROM users
            WHERE email = ?
        `,
      )
      .get(email);

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    return res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed",
    });
  }
};

const getMe = (req, res) => {
  try {
    const user = db
      .prepare(
        `
            SELECT id, name, email, role, created_at
            FROM users
            WHERE id = ?
        `,
      )
      .get(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user: user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Failed to get user information",
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
