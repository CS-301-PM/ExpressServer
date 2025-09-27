// controllers/UserControllers.js

require("dotenv").config();
const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Web3Service = require("../blockchain/Web3Service");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

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

    const account = await Web3Service.generateBlockchainAccount();
    const encryptedPrivateKey = Web3Service.encryptPrivateKey(
      account.privateKey
    );

    const user = await User.create({
      username,
      first_name,
      last_name,
      email: email || null,
      password_hash: hashedPassword,
      role: role || "ADMIN",
      department: department || "",
      blockchain_address: account.address,
      encrypted_private_key: encryptedPrivateKey,
    });

    // On-chain log: USER_SIGNUP
    try {
      const logPayload = {
        userId: user.id,
        username,
        firstName: first_name,
        lastName: last_name,
        role: user.role,
        department: user.department,
        address: user.blockchain_address,
        timestamp: new Date().toISOString(),
      };
      await Web3Service.loggerProposeAsNode(
        "USER_SIGNUP",
        JSON.stringify(logPayload)
      );
    } catch (_) {}

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        username,
        first_name,
        last_name,
        role,
        department,
        blockchain_address: account.address,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in SignUp" });
  }
};

const SignIn = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    // On-chain log: USER_SIGNIN
    try {
      const logPayload = {
        userId: user.id,
        username: user.username,
        role: user.role,
        timestamp: new Date().toISOString(),
      };
      await Web3Service.loggerProposeAsNode(
        "USER_SIGNIN",
        JSON.stringify(logPayload)
      );
    } catch (_) {}

    res.status(200).json({ message: "Signed in successfully", token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in SignIn" });
  }
};

const SignOut = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    // On-chain log: USER_SIGNOUT
    try {
      const logPayload = {
        userId: user?.id || req.user.id,
        username: user?.username || null,
        timestamp: new Date().toISOString(),
      };
      await Web3Service.loggerProposeAsNode(
        "USER_SIGNOUT",
        JSON.stringify(logPayload)
      );
    } catch (_) {}

    res.status(200).json({ message: "User signed out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in SignOut" });
  }
};

const Signed = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // On-chain log: USER_SESSION_VALID
    try {
      const logPayload = {
        userId: user.id,
        username: user.username,
        timestamp: new Date().toISOString(),
      };
      await Web3Service.loggerProposeAsNode(
        "USER_SESSION_VALID",
        JSON.stringify(logPayload)
      );
    } catch (_) {}

    res.status(200).json({ message: "User is signed in", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in Signed" });
  }
};

const Delete = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // On-chain log: USER_DELETED
    try {
      const logPayload = {
        userId: user.id,
        username: user.username,
        timestamp: new Date().toISOString(),
      };
      await Web3Service.loggerProposeAsNode(
        "USER_DELETED",
        JSON.stringify(logPayload)
      );
    } catch (_) {}

    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in Delete" });
  }
};

const Edit = async (req, res) => {
  try {
    const { id, first_name, last_name, email, role, department } = req.body;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const before = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      department: user.department,
    };

    await user.update({
      first_name: first_name || user.first_name,
      last_name: last_name || user.last_name,
      email: email || user.email,
      role: role || user.role,
      department: department || user.department,
    });

    // On-chain log: USER_UPDATED
    try {
      const after = {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        department: user.department,
      };
      const changed = {};
      for (const k of Object.keys(after)) {
        if (after[k] !== before[k])
          changed[k] = { before: before[k], after: after[k] };
      }
      const logPayload = {
        userId: user.id,
        changed,
        timestamp: new Date().toISOString(),
      };
      await Web3Service.loggerProposeAsNode(
        "USER_UPDATED",
        JSON.stringify(logPayload)
      );
    } catch (_) {}

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in Edit" });
  }
};

const GetAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();

    // On-chain logging skipped.

    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in GetAllUsers" });
  }
};

const EditSpecificUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const before = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      department: user.department,
    };

    await user.update(updates);

    // On-chain log: USER_UPDATED
    try {
      const after = {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        department: user.department,
      };
      const changed = {};
      for (const k of Object.keys(after)) {
        if (
          Object.prototype.hasOwnProperty.call(updates, k) &&
          after[k] !== before[k]
        ) {
          changed[k] = { before: before[k], after: after[k] };
        }
      }
      const logPayload = {
        userId: user.id,
        changed,
        timestamp: new Date().toISOString(),
      };
      await Web3Service.loggerProposeAsNode(
        "USER_UPDATED",
        JSON.stringify(logPayload)
      );
    } catch (_) {}

    res.status(200).json({ message: "User updated successfully", user });
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
