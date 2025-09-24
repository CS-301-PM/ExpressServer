const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Middleware to extract user from JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ error: "Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.user = decoded; // contains id and role
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// SignUp
const SignUp = async (req, res) => {
  try {
    const {
      username,
      first_name,
      last_name,
      password,
      role,
      email,
      department,
    } = req.body;

    if (!username || !first_name || !last_name || !password) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided" });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: "Username already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      first_name,
      last_name,
      email: email || null,
      password_hash: hashedPassword,
      role: role || "ADMIN",
      department: department || "",
      blockchain_address: "",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        department: user.department,
        blockchain_address: user.blockchain_address,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in SignUp" });
  }
};

// SignIn
const SignIn = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res
        .status(400)
        .json({ error: "Username and password are required" });

    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Signed in successfully",
      token,
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        department: user.department,
        blockchain_address: user.blockchain_address,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in SignIn" });
  }
};

// SignOut
const SignOut = async (req, res) => {
  try {
    res.status(200).json({ message: "User signed out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in SignOut" });
  }
};

// Check if Signed (requires Bearer token)
const Signed = async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Expect: "Bearer <token>"

    if (!token) {
      return res.status(401).json({ error: "Token missing" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    } catch (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    // Find user by ID from decoded token
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Return user info (without password)
    res.status(200).json({
      message: "User is signed in",
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        department: user.department,
        blockchain_address: user.blockchain_address,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in Signed" });
  }
};

// Delete User
const Delete = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in Delete" });
  }
};

// Edit User
const Edit = async (req, res) => {
  try {
    const { id, first_name, last_name, email, role, department } = req.body;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.update({
      first_name: first_name || user.first_name,
      last_name: last_name || user.last_name,
      email: email || user.email,
      role: role || user.role,
      department: department || user.department,
    });

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        department: user.department,
        blockchain_address: user.blockchain_address,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in Edit" });
  }
};
// controllers/UserControllers.js

// Get all users
const GetAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in GetAllUsers" });
  }
};

// Edit a specific user by ID
const EditSpecificUser = async (req, res) => {
  try {
    const { id } = req.params; // user ID from route parameter
    const updates = req.body;
    console.log(id);

    const user = await User.editById(id, updates);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in EditSpecificUser" });
  }
};

module.exports = {
  SignUp,
  SignIn,
  SignOut,
  Signed,
  Delete,
  Edit,
  EditSpecificUser,
  GetAllUsers,
  authenticateToken,
};
