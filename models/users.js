// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const Web3Service = require("../blockchain/Web3Service");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(
        "ADMIN",
        "STORES_MANAGER",
        "DEPARTMENT_DEAN",
        "PROCUREMENT_OFFICER",
        "CFO"
      ),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      // unique: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: true,
      // unique: true,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "",
    },
    blockchain_address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    encrypted_private_key: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);

// Hooks for blockchain integration
User.beforeCreate(async (user) => {
  // Generate blockchain account for new users
  if (!user.blockchain_address) {
    try {
      const account = await Web3Service.generateBlockchainAccount();
      user.blockchain_address = account.address;
      user.encrypted_private_key = Web3Service.encryptPrivateKey(
        account.privateKey
      );
    } catch (error) {
      console.error("Failed to generate blockchain account:", error);
    }
  }
});

User.beforeUpdate(async (user) => {
  // Assign role on blockchain when user role changes
  if (user.changed("role") && user.blockchain_address) {
    try {
      const privateKey = Web3Service.decryptPrivateKey(
        user.encrypted_private_key
      );
      if (privateKey) {
        await Web3Service.assignRoleOnChain(
          user.blockchain_address,
          user.role,
          true,
          process.env.DEPLOYER_PRIVATE_KEY
        );
      }
    } catch (error) {
      console.error("Failed to assign role on blockchain:", error);
    }
  }
});

// ----- STATIC METHODS -----

// Edit user by ID
User.editById = async function (id, updates) {
  const user = await User.findByPk(id);
  if (!user) return null;

  const allowedUpdates = [
    "role",
    "last_name",
    "first_name",
    "email",
    "username",
    "department",
    "blockchain_address",
    "encrypted_private_key",
  ];

  allowedUpdates.forEach((field) => {
    if (updates[field] !== undefined) user[field] = updates[field];
  });

  user.updated_at = new Date();
  await user.save();

  const { password_hash, encrypted_private_key, ...rest } = user.get({
    plain: true,
  });
  return rest;
};

// Get all users
User.getAllUsers = async function () {
  const users = await User.findAll({
    attributes: { exclude: ["password_hash", "encrypted_private_key"] },
  });
  return users;
};

// Get user with blockchain credentials
User.getWithBlockchainCredentials = async function (id) {
  const user = await User.findByPk(id);
  if (!user) return null;

  return user;
};

module.exports = User;
