const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
require("dotenv").config();
const cors = require("cors");

// CORS configuration
const setCors = {
  origin: [
    process.env.ORIGIN,
    "*",
    "http://192.168.184.43:5173",
    "http://110.104.11.252:5173",
    "http://192.168.137.137",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};
app.use(cors(setCors));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
const UserRoutes = require("./routes/usersRoutes");
const { authMiddleware } = require("./controllers/usersControllers");
const Requests = require("./routes/requestsRoutes");
const Stocks = require("./routes/stocksRoutes");
const Blockchain = require("./routes/blockchainRoutes");

app.use(UserRoutes);
// app.use(authMiddleware);
app.use(Requests);
app.use(Stocks);
app.use(Blockchain);

// Start server
const PORT = process.env.SERVER_PORT || 1010;
app.listen(PORT, () => {
  console.log(`SERVER RUNNING on port ${PORT}`);
});
