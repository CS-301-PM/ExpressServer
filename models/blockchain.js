// models/blockchain.js
const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize"); // adjust the path to your sequelize instance
const User = require("./users");
const Stock = require("./stocks");
const Request = require("./requests");

const Blockchain = sequelize.define(
  "Blockchain",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    transaction_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    request_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    block_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stock_id: {
      type: DataTypes.INTEGER,
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
    tableName: "blockchain",
    timestamps: false,
  }
);

// Associations
Blockchain.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
Blockchain.belongsTo(Stock, { foreignKey: "stock_id", onDelete: "CASCADE" });
Blockchain.belongsTo(Request, {
  foreignKey: "request_id",
  onDelete: "CASCADE",
});

module.exports = Blockchain;
