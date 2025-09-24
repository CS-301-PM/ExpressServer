// // // Web3 v4 style imports
// // const { Web3 } = require("web3");
// // const crypto = require("crypto");
// // //  SERVER CODE
// // const express = require("express");
// // const app = express();
// // const cookieParser = require("cookie-parser");
// // require("dotenv").config();
// // const cors = require("cors");
// // // PART A DONE
// // // class Web3Service {
// // //   constructor() {
// // //     this.providerUrl = process.env.WEB3_PROVIDER_URI || "http://127.0.0.1:7545";
// // //     this.web3 = new Web3(this.providerUrl); //  v4 allows direct URL
// // //     this.contractAddress = process.env.CONTRACT_ADDRESS;
// // //     this.contract = null;
// // //     this.abi = this.getContractABI();

// // //     if (this.contractAddress) {
// // //       this.contract = new this.web3.eth.Contract(
// // //         this.abi,
// // //         this.contractAddress
// // //       );
// // //     }
// // //   }

// // //   getContractABI() {
// // //     return [
// // //       {
// // //         inputs: [],
// // //         name: "getContractInfo",
// // //         outputs: [{ internalType: "string", name: "", type: "string" }],
// // //         stateMutability: "view",
// // //         type: "function",
// // //       },
// // //       {
// // //         inputs: [
// // //           { internalType: "address", name: "user", type: "address" },
// // //           { internalType: "string", name: "role", type: "string" },
// // //           { internalType: "bool", name: "status", type: "bool" },
// // //         ],
// // //         name: "assignRole",
// // //         outputs: [],
// // //         stateMutability: "nonpayable",
// // //         type: "function",
// // //       },
// // //       {
// // //         inputs: [
// // //           { internalType: "string", name: "itemName", type: "string" },
// // //           { internalType: "uint256", name: "quantity", type: "uint256" },
// // //           { internalType: "string", name: "priority", type: "string" },
// // //           { internalType: "string", name: "reason", type: "string" },
// // //         ],
// // //         name: "createRequest",
// // //         outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
// // //         stateMutability: "nonpayable",
// // //         type: "function",
// // //       },
// // //       {
// // //         inputs: [
// // //           { internalType: "uint256", name: "requestId", type: "uint256" },
// // //           { internalType: "bool", name: "approved", type: "bool" },
// // //           { internalType: "string", name: "reason", type: "string" },
// // //         ],
// // //         name: "approveRequest",
// // //         outputs: [],
// // //         stateMutability: "nonpayable",
// // //         type: "function",
// // //       },
// // //       {
// // //         inputs: [
// // //           { internalType: "string", name: "itemName", type: "string" },
// // //           { internalType: "int256", name: "quantityChange", type: "int256" },
// // //           { internalType: "string", name: "reason", type: "string" },
// // //         ],
// // //         name: "adjustStock",
// // //         outputs: [],
// // //         stateMutability: "nonpayable",
// // //         type: "function",
// // //       },
// // //       {
// // //         anonymous: false,
// // //         inputs: [
// // //           {
// // //             indexed: true,
// // //             internalType: "address",
// // //             name: "user",
// // //             type: "address",
// // //           },
// // //           {
// // //             indexed: true,
// // //             internalType: "string",
// // //             name: "role",
// // //             type: "string",
// // //           },
// // //           {
// // //             indexed: false,
// // //             internalType: "bool",
// // //             name: "status",
// // //             type: "bool",
// // //           },
// // //         ],
// // //         name: "RoleAssigned",
// // //         type: "event",
// // //       },
// // //       {
// // //         anonymous: false,
// // //         inputs: [
// // //           {
// // //             indexed: true,
// // //             internalType: "uint256",
// // //             name: "requestId",
// // //             type: "uint256",
// // //           },
// // //           {
// // //             indexed: true,
// // //             internalType: "address",
// // //             name: "requester",
// // //             type: "address",
// // //           },
// // //           {
// // //             indexed: false,
// // //             internalType: "string",
// // //             name: "itemName",
// // //             type: "string",
// // //           },
// // //           {
// // //             indexed: false,
// // //             internalType: "uint256",
// // //             name: "quantity",
// // //             type: "uint256",
// // //           },
// // //         ],
// // //         name: "RequestCreated",
// // //         type: "event",
// // //       },
// // //     ];
// // //   }

// // //   async isConnected() {
// // //     try {
// // //       return await this.web3.eth.net.isListening();
// // //     } catch (err) {
// // //       return false;
// // //     }
// // //   }

// // //   async generateBlockchainAccount() {
// // //     const account = this.web3.eth.accounts.create();
// // //     return {
// // //       address: account.address,
// // //       privateKey: account.privateKey,
// // //     };
// // //   }

// // //   encryptPrivateKey(privateKey) {
// // //     const algorithm = "aes-256-gcm";
// // //     const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex"); // must be 32 bytes
// // //     const iv = crypto.randomBytes(16);

// // //     const cipher = crypto.createCipheriv(algorithm, key, iv);
// // //     cipher.setAAD(Buffer.from("CBUStores"));

// // //     let encrypted = cipher.update(privateKey, "utf8", "hex");
// // //     encrypted += cipher.final("hex");

// // //     const authTag = cipher.getAuthTag();

// // //     return JSON.stringify({
// // //       iv: iv.toString("hex"),
// // //       data: encrypted,
// // //       authTag: authTag.toString("hex"),
// // //     });
// // //   }

// // //   decryptPrivateKey(encryptedData) {
// // //     if (!encryptedData) return null;

// // //     try {
// // //       const algorithm = "aes-256-gcm";
// // //       const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
// // //       const data = JSON.parse(encryptedData);

// // //       const decipher = crypto.createDecipheriv(
// // //         algorithm,
// // //         key,
// // //         Buffer.from(data.iv, "hex")
// // //       );
// // //       decipher.setAAD(Buffer.from("CBUStores"));
// // //       decipher.setAuthTag(Buffer.from(data.authTag, "hex"));

// // //       let decrypted = decipher.update(data.data, "hex", "utf8");
// // //       decrypted += decipher.final("utf8");

// // //       return decrypted;
// // //     } catch (error) {
// // //       console.error("Decryption error:", error);
// // //       return null;
// // //     }
// // //   }

// // //   async sendTransaction(method, fromAddress, privateKey, params = []) {
// // //     try {
// // //       const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
// // //       this.web3.eth.accounts.wallet.add(account);

// // //       const gasEstimate = await method(...params).estimateGas({
// // //         from: fromAddress,
// // //       });
// // //       const gasPrice = await this.web3.eth.getGasPrice();

// // //       const tx = method(...params);
// // //       const result = await tx.send({
// // //         from: fromAddress,
// // //         gas: Math.round(gasEstimate * 1.2),
// // //         gasPrice,
// // //       });

// // //       return { success: true, transactionHash: result.transactionHash };
// // //     } catch (error) {
// // //       console.error("Transaction failed:", error);
// // //       return { success: false, error: error.message };
// // //     }
// // //   }

// // //   async createRequestOnChain(
// // //     itemName,
// // //     quantity,
// // //     priority,
// // //     reason,
// // //     userAddress,
// // //     privateKey
// // //   ) {
// // //     if (!this.contract) {
// // //       return { success: false, error: "Contract not loaded" };
// // //     }

// // //     return await this.sendTransaction(
// // //       this.contract.methods.createRequest,
// // //       userAddress,
// // //       privateKey,
// // //       [itemName, quantity.toString(), priority, reason]
// // //     );
// // //   }

// // //   async approveRequestOnChain(
// // //     requestId,
// // //     approved,
// // //     reason,
// // //     approverAddress,
// // //     privateKey
// // //   ) {
// // //     if (!this.contract) {
// // //       return { success: false, error: "Contract not loaded" };
// // //     }

// // //     return await this.sendTransaction(
// // //       this.contract.methods.approveRequest,
// // //       approverAddress,
// // //       privateKey,
// // //       [requestId.toString(), approved, reason]
// // //     );
// // //   }

// // //   async assignRoleOnChain(userAddress, role, status, adminPrivateKey) {
// // //     if (!this.contract) {
// // //       return { success: false, error: "Contract not loaded" };
// // //     }

// // //     return await this.sendTransaction(
// // //       this.contract.methods.assignRole,
// // //       process.env.DEPLOYER_ACCOUNT_ADDRESS,
// // //       adminPrivateKey,
// // //       [userAddress, role, status]
// // //     );
// // //   }

// // //   //  COMPREHENSIVE FIX: Web3.js v4 compatible event subscriptions
// // //   async subscribeToEvents() {
// // //     if (!this.contract) {
// // //       console.warn(" Contract not loaded. Event subscription skipped.");
// // //       return false;
// // //     }

// // //     try {
// // //       // First, verify we can connect to the provider
// // //       const isListening = await this.web3.eth.net.isListening();
// // //       if (!isListening) {
// // //         console.warn(
// // //           " Web3 provider not listening. Event subscription skipped."
// // //         );
// // //         return false;
// // //       }

// // //       console.log(" Setting up event subscriptions...");

// // //       // Web3.js v4 - Use getPastEvents and subscription pattern
// // //       const subscription = await this.web3.eth.subscribe("logs", {
// // //         address: this.contractAddress,
// // //         topics: [], // Subscribe to all events from this contract
// // //       });

// // //       subscription.on("data", (log) => {
// // //         try {
// // //           // Decode the log using the contract ABI
// // //           const decodedLog = this.web3.eth.abi.decodeLog(
// // //             this.getEventInputs(log.topics[0]),
// // //             log.data,
// // //             log.topics.slice(1)
// // //           );

// // //           const eventName = this.getEventName(log.topics[0]);
// // //           console.log(`${eventName} event:`, {
// // //             ...decodedLog,
// // //             transactionHash: log.transactionHash,
// // //             blockNumber: log.blockNumber,
// // //           });
// // //         } catch (decodeError) {
// // //           console.log(" Raw blockchain event:", {
// // //             address: log.address,
// // //             transactionHash: log.transactionHash,
// // //             blockNumber: log.blockNumber,
// // //           });
// // //         }
// // //       });

// // //       subscription.on("error", (error) => {
// // //         console.error(" Event subscription error:", error);
// // //       });

// // //       // Store subscription for cleanup
// // //       this.eventSubscription = subscription;
// // //       console.log(" Event subscriptions initialized successfully");
// // //       return true;
// // //     } catch (error) {
// // //       console.error(" Error setting up event subscriptions:", error.message);

// // //       // Fallback: Try alternative approach
// // //       return this.setupFallbackEventListening();
// // //     }
// // //   }

// // //   // Helper method to get event signature hash
// // //   getEventName(topicHash) {
// // //     const eventSignatures = {
// // //       [this.web3.utils.keccak256("RoleAssigned(address,string,bool)")]:
// // //         "RoleAssigned",
// // //       [this.web3.utils.keccak256(
// // //         "RequestCreated(uint256,address,string,uint256)"
// // //       )]: "RequestCreated",
// // //       [this.web3.utils.keccak256(
// // //         "RequestApproved(uint256,address,bool,string)"
// // //       )]: "RequestApproved",
// // //     };
// // //     return eventSignatures[topicHash] || "Unknown";
// // //   }

// // //   // Helper method to get event inputs for decoding
// // //   getEventInputs(topicHash) {
// // //     const eventInputs = {
// // //       [this.web3.utils.keccak256("RoleAssigned(address,string,bool)")]: [
// // //         { indexed: true, name: "user", type: "address" },
// // //         { indexed: true, name: "role", type: "string" },
// // //         { indexed: false, name: "status", type: "bool" },
// // //       ],
// // //       [this.web3.utils.keccak256(
// // //         "RequestCreated(uint256,address,string,uint256)"
// // //       )]: [
// // //         { indexed: true, name: "requestId", type: "uint256" },
// // //         { indexed: true, name: "requester", type: "address" },
// // //         { indexed: false, name: "itemName", type: "string" },
// // //         { indexed: false, name: "quantity", type: "uint256" },
// // //       ],
// // //     };
// // //     return eventInputs[topicHash] || [];
// // //   }

// // //   // Fallback event listening approach
// // //   setupFallbackEventListening() {
// // //     try {
// // //       console.log(" Setting up fallback event listening...");

// // //       // Use polling approach as fallback
// // //       this.eventPollingInterval = setInterval(async () => {
// // //         try {
// // //           const latestBlock = await this.web3.eth.getBlockNumber();
// // //           // Check for events in recent blocks (last 5 blocks)
// // //           const fromBlock = Math.max(0, Number(latestBlock) - 5);

// // //           const logs = await this.web3.eth.getPastLogs({
// // //             address: this.contractAddress,
// // //             fromBlock: fromBlock,
// // //             toBlock: "latest",
// // //           });

// // //           if (logs.length > 0) {
// // //             console.log(`Found ${logs.length} recent events`);
// // //           }
// // //         } catch (pollError) {
// // //           // Silent fail for polling errors
// // //         }
// // //       }, 5000); // Poll every 5 seconds

// // //       console.log(" Fallback event listening activated");
// // //       return true;
// // //     } catch (error) {
// // //       console.error(" Fallback event setup failed:", error.message);
// // //       return false;
// // //     }
// // //   }

// // //   // Cleanup method
// // //   cleanup() {
// // //     if (this.eventSubscription) {
// // //       this.eventSubscription.unsubscribe();
// // //     }
// // //     if (this.eventPollingInterval) {
// // //       clearInterval(this.eventPollingInterval);
// // //     }
// // //   }

// // //   //  NEW: Method to initialize contract after deployment
// // //   initializeContract(contractAddress) {
// // //     if (!contractAddress) {
// // //       console.warn(" No contract address provided");
// // //       return false;
// // //     }

// // //     try {
// // //       this.contractAddress = contractAddress;
// // //       this.contract = new this.web3.eth.Contract(this.abi, contractAddress);
// // //       console.log(" Contract initialized at:", contractAddress);
// // //       return true;
// // //     } catch (error) {
// // //       console.error(" Failed to initialize contract:", error);
// // //       return false;
// // //     }
// // //   }
// // // }

// // // module.exports = new Web3Service();

// // // CORS configuration
// // const setCors = {
// //   origin: [
// //     process.env.ORIGIN,
// //     "*",
// //     "http://192.168.184.43:5173",
// //     "http://110.104.11.252:5173",
// //     "http://192.168.137.137",
// //   ],
// //   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
// //   credentials: true,
// // };
// // app.use(cors(setCors));

// // // Middlewares
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));
// // app.use(cookieParser());

// // // Routes
// // const UserRoutes = require("./src/routes/usersRoutes");
// // const { authMiddleware } = require("./src/controllers/usersControllers");
// // const Requests = require("./src/routes/requestsRoutes");
// // const Stocks = require("./src/routes/stocksRoutes");
// // const Blockchain = require("./src/routes/blockchainRoutes");

// // app.use(UserRoutes);
// // // app.use(authMiddleware);
// // app.use(Requests);
// // app.use(Stocks);
// // app.use(Blockchain);

// // // Start server
// // const PORT = process.env.SERVER_PORT || 1010;
// // app.listen(PORT, () => {
// //   console.log(`SERVER RUNNING on port ${PORT}`);
// // });

// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const { sequelize, syncDatabase } = require("./config");
// const authRoutes = require("./routes/usersRoutes");
// const dashboardRoutes = require("./routes/departments");
// const requestRoutes = require("./routes/requests");
// const stockRoutes = require("./routes/stocks");
// const blockchainRoutes = require("./routes/blockchainRoutes");
// // const blockchainRoutes = require("./routes/blockchain");
// const web3Service = require("./blockchain/Web3Service");

// const app = express();
// const PORT = process.env.PORT || 8000;

// // CORS configuration
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:5173",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// // Middleware
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/requests", requestRoutes);
// app.use("/api/stocks", stockRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/blockchain", blockchainRoutes);

// // Health check endpoint
// app.get("/api/health", (req, res) => {
//   res.json({
//     status: "OK",
//     timestamp: new Date().toISOString(),
//     database: "Connected",
//     blockchain: web3Service.contractAddress ? "Connected" : "Not Connected",
//     contract: web3Service.contractAddress || "Not Deployed",
//   });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(" Unhandled error:", err);
//   res.status(500).json({
//     message: "Internal server error",
//     error:
//       process.env.NODE_ENV === "development"
//         ? err.message
//         : "Something went wrong",
//   });
// });

// // 404 handler
// app.use("*", (req, res) => {
//   res.status(404).json({
//     message: "Route not found",
//     path: req.originalUrl,
//   });
// });

// // Initialize application
// async function initializeApp() {
//   try {
//     // 1. Connect to database
//     console.log(" Connecting to database...");
//     await sequelize.authenticate();
//     console.log(" Database connection established");

//     // 2. Sync database models
//     console.log(" Synchronizing database models...");
//     await syncDatabase();
//     console.log(" Database models synchronized");

//     // 3. Test blockchain connection
//     console.log(" Testing blockchain connection...");
//     const isConnected = await web3Service.isConnected();
//     if (isConnected) {
//       console.log(" Blockchain connected successfully");

//       // 4. Setup event subscriptions (with proper error handling)
//       console.log(" Setting up blockchain event subscriptions...");
//       try {
//         const eventSetup = await web3Service.subscribeToEvents();
//         if (eventSetup) {
//           console.log(" Blockchain event listeners activated");
//         } else {
//           console.log("⚠ Event listeners disabled, continuing without events");
//         }
//       } catch (eventError) {
//         console.warn("⚠ Event subscription failed:", eventError.message);
//         console.log("ℹ Application will continue without event listeners");
//       }
//     } else {
//       console.warn(
//         "⚠ Blockchain connection failed - check if Ganache is running"
//       );
//       console.log("ℹ Application will continue without blockchain features");
//     }

//     // 5. Start server
//     const server = app.listen(PORT, () => {
//       console.log(`\n CBU Central Stores API running on port ${PORT}`);
//       console.log(`Blockchain: ${isConnected ? "Connected" : "Disconnected"}`);
//       console.log(`Database: ${process.env.DB_NAME || "central_stores"}`);
//       console.log(
//         `Origin: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
//       );

//       if (web3Service.contractAddress) {
//         console.log(`📋 Contract: ${web3Service.contractAddress}`);
//       } else {
//         console.log(
//           '📋 Contract: Not deployed - run "npx truffle migrate" to deploy'
//         );
//       }

//       console.log(`\n API Documentation:`);
//       console.log(`   Health Check: http://localhost:${PORT}/api/health`);
//       console.log(`   Auth: http://localhost:${PORT}/api/auth/`);
//       console.log(`   Requests: http://localhost:${PORT}/api/requests/`);
//       console.log(`   Stocks: http://localhost:${PORT}/api/stocks/`);
//       console.log(`   Admin: http://localhost:${PORT}/api/admin/`);
//       console.log(`   Blockchain: http://localhost:${PORT}/api/blockchain/\n`);
//     });

//     // Graceful shutdown
//     const gracefulShutdown = (signal) => {
//       console.log(`\n Received ${signal}. Starting graceful shutdown...`);

//       server.close(async () => {
//         console.log(" HTTP server closed");

//         try {
//           // Cleanup blockchain connections
//           if (web3Service.cleanup) {
//             web3Service.cleanup();
//             console.log(" Blockchain connections cleaned up");
//           }

//           // Close database connection
//           await sequelize.close();
//           console.log(" Database connection closed");

//           console.log(" Graceful shutdown completed");
//           process.exit(0);
//         } catch (error) {
//           console.error(" Error during shutdown:", error);
//           process.exit(1);
//         }
//       });
//     };

//     // Handle shutdown signals
//     process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
//     process.on("SIGINT", () => gracefulShutdown("SIGINT"));
//   } catch (error) {
//     console.error(" Application initialization failed:", error);
//     process.exit(1);
//   }
// }

// // Start the application
// initializeApp();

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const sequelize = require("./sequelize");

// Import routes from your structure
const userRoutes = require("./routes/usersRoutes");
const requestRoutes = require("./routes/requestsRoutes");
const stockRoutes = require("./routes/stocksRoutes");
const departmentRoutes = require("./routes/departments");
const blockchainRoutes = require("./routes/blockchainRoutes");

// Import Web3Service (make sure this file exists)
const Web3Service = require("./blockchain/Web3Service");

const app = express();
const PORT = process.env.SERVER_PORT || 8000;

// CORS configuration
app.use(
  cors({
    origin: process.env.ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Routes - using your existing route files
app.use(userRoutes);
app.use(requestRoutes);
app.use(stockRoutes);
app.use(departmentRoutes);
app.use(blockchainRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: "Connected",
    blockchain: Web3Service.isConnected() ? "Connected" : "Not Connected",
    contract: process.env.CONTRACT_ADDRESS || "Not Deployed",
  });
});

// Test database connection endpoint
app.get("/api/test-db", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: "Database connected successfully",
      database: process.env.DB_NAME,
    });
  } catch (error) {
    res.status(500).json({
      error: "Database connection failed",
      details: error.message,
    });
  }
});

// Test blockchain connection endpoint
app.get("/api/test-blockchain", async (req, res) => {
  try {
    const isConnected = Web3Service.isConnected();
    res.json({
      blockchain: isConnected ? "Connected" : "Not Connected",
      provider: process.env.WEB3_PROVIDER_URI,
      contract: process.env.CONTRACT_ADDRESS || "Not deployed",
    });
  } catch (error) {
    res.status(500).json({
      error: "Blockchain test failed",
      details: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// 404 handler
app.use("/home", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    availableEndpoints: [
      "/api/health",
      "/api/test-db",
      "/api/test-blockchain",
      "/api/user/signin",
      "/api/user/signup",
      "/api/requests/all",
      "/api/stocks/all",
      "/api/blockchain/all",
    ],
  });
});

// Initialize application
async function initializeApp() {
  try {
    console.log("Initializing CBU Central Stores Application...\n");

    // 1. Connect to database
    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("Database connection established");

    // 2. Sync database models
    console.log("Synchronizing database models...");
    await sequelize.sync({ alter: true });
    console.log("Database models synchronized");

    // 3. Test blockchain connection
    console.log("Testing blockchain connection...");
    const isBlockchainConnected = Web3Service.isConnected();

    if (isBlockchainConnected) {
      console.log("Blockchain connected successfully");

      // Setup event subscriptions
      try {
        Web3Service.subscribeToEvents();
        console.log("Blockchain event listeners activated");
      } catch (eventError) {
        console.warn("Event subscription failed:", eventError.message);
      }
    } else {
      console.warn("Blockchain connection failed - running in offline mode");
      console.log("Start Ganache: ganache-cli -d");
    }

    // 4. Start server
    app.listen(PORT, "0.0.0.0", () => {
      //   console.log("\nApplication initialized successfully!");
      //   console.log("=========================================");
      // console.log(CBU Central Stores API running on port ${PORT});
      // console.log(Blockchain: ${isBlockchainConnected ? 'Connected' : 'Disconnected'});
      // console.log(Database: ${process.env.DB_NAME || 'central_stores'});
      // console.log(Origin: ${process.env.ORIGIN || 'http://localhost:5173'});

      if (process.env.CONTRACT_ADDRESS) {
        // console.log(Contract: ${process.env.CONTRACT_ADDRESS});
      } else {
        console.log("Contract: Not deployed - run deployment script");
      }
      //   console.log("\nAvailable API Endpoints:");
      //   console.log(`   Health Check: http://localhost:${PORT}/api/health`);
      //   console.log(`   Database Test: http://localhost:${PORT}/api/test-db`);
      //   console.log(
      //     `   Blockchain Test: http://localhost:${PORT}/api/test-blockchain`
      //   );
      //   console.log(`   User Auth: http://localhost:${PORT}/api/user/`);
      //   console.log(`   Requests: http://localhost:${PORT}/api/requests/`);
      //   console.log(`   Stocks: http://localhost:${PORT}/api/stocks/`);
      //   console.log(`   Departments: http://localhost:${PORT}/api/departments/`);
      //   console.log(`   Blockchain: http://localhost:${PORT}/api/blockchain/`);
      //   console.log("\nTo deploy contract: node deploy.js");
      //   console.log("=========================================\n");
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      // console.log(\nReceived ${signal}. Starting graceful shutdown...);

      process.exit(0);
    };

    // Handle shutdown signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("Application initialization failed:", error);
    process.exit(1);
  }
}

// Start the application
initializeApp();

module.exports = app;
