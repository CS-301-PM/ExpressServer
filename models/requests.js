const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize"); // make sure your sequelize instance is exported

const Request = sequelize.define(
  "Request",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stock_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    item_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH"),
      defaultValue: "LOW",
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "APPROVED",
        "REJECTED",
        "FULFILLED",
        "IN_PROGRESS"
      ),
      defaultValue: "PENDING",
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    blockchain_address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "requests",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Request;
