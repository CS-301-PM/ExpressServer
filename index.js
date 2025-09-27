require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Import routes from your structure
const userRoutes = require("./routes/usersRoutes");
const requestRoutes = require("./routes/requestsRoutes");
const stockRoutes = require("./routes/stocksRoutes");
const departmentRoutes = require("./routes/departments");
const blockchainRoutes = require("./routes/blockchainRoutes");
const blockchainStatusRoutes = require("./routes/blockchainStatusRoutes");

const app = express();

// CORS configuration
const setCors = {
  origin: [process.env.ORIGIN, "*", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};
app.use(cors(setCors));

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes

app.use(userRoutes);
app.use(blockchainStatusRoutes);
app.use(requestRoutes);
app.use(stockRoutes);
app.use(departmentRoutes);
app.use(blockchainRoutes);

// Start server
const PORT = process.env.SERVER_PORT || 8000;
app.listen(PORT, () => {
  console.log(`SERVER RUNNING on port ${PORT}`);
});
