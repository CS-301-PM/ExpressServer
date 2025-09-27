// const Request = require("../models/requests");
// const Blockchain = require("../models/blockchain");
// const User = require("../models/users");
// const Web3Service = require("../blockchain/Web3Service");
// const { v4: uuidv4 } = require("uuid");

// // Make a request with blockchain integration
// const MakeRequest = async (req, res) => {
//   try {
//     const {
//       user_id,
//       stock_id,
//       item_name,
//       quantity,
//       priority,
//       reason,
//       department,
//     } = req.body;

//     const blockchain_address = uuidv4();

//     // console.log(req.body);

//     // Create request in database
//     const request = await Request.create({
//       user_id,
//       stock_id,
//       item_name,
//       quantity,
//       priority: priority || "LOW",
//       reason: reason || null,
//       department,
//       blockchain_address,
//     });

//     // Create blockchain transaction
//     const user = await User.findByPk(user_id);
//     if (user && user.blockchain_address) {
//       const privateKey = Web3Service.decryptPrivateKey(
//         user.encrypted_private_key
//       );

//       if (privateKey) {
//         const blockchainResult = await Web3Service.createRequestOnChain(
//           item_name,
//           quantity,
//           priority || "LOW",
//           reason || "",
//           user.blockchain_address,
//           privateKey
//         );

//         if (blockchainResult.success) {
//           // Record successful blockchain transaction
//           const lastBlock = await Blockchain.findOne({
//             order: [["block_number", "DESC"]],
//           });
//           const nextBlockNumber = lastBlock ? lastBlock.block_number + 1 : 1;

//           await Blockchain.create({
//             transaction_id: blockchainResult.transactionHash,
//             request_id: request.id,
//             block_number: nextBlockNumber,
//             status: "PENDING",
//             user_id: user_id,
//             stock_id: stock_id,
//           });
//         }
//       }
//     }

//     res.status(201).json({
//       message: "Request created successfully",
//       request,
//       blockchain_success: !!blockchainResult?.success,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error in MakeRequest" });
//   }
// };

// // Edit a request with blockchain approval
// const EditRequest = async (req, res) => {
//   try {
//     const request = await Request.findByPk(req.params.id);
//     if (!request) return res.status(404).json({ error: "Request not found" });

//     const { status, approval_reason } = req.body;
//     if (!status) {
//       return res.status(400).json({ error: "New status must be provided" });
//     }

//     // Update request status
//     await request.update({ status });

//     // Get approver user
//     const approver = await User.findByPk(req.user.id);

//     // Blockchain approval transaction
//     if (
//       approver &&
//       approver.blockchain_address &&
//       (status === "APPROVED" || status === "REJECTED")
//     ) {
//       const privateKey = Web3Service.decryptPrivateKey(
//         approver.encrypted_private_key
//       );

//       if (privateKey) {
//         const blockchainResult = await Web3Service.approveRequestOnChain(
//           request.id,
//           status === "APPROVED",
//           approval_reason || "No reason provided",
//           approver.blockchain_address,
//           privateKey
//         );

//         if (blockchainResult.success) {
//           // Record blockchain transaction
//           const lastBlock = await Blockchain.findOne({
//             order: [["block_number", "DESC"]],
//           });
//           const nextBlockNumber = lastBlock ? lastBlock.block_number + 1 : 1;

//           const transaction = await Blockchain.create({
//             transaction_id: blockchainResult.transactionHash,
//             request_id: request.id,
//             block_number: nextBlockNumber,
//             status: status,
//             user_id: request.user_id,
//             stock_id: request.stock_id,
//           });

//           return res.status(200).json({
//             message:
//               "Request status updated and blockchain transaction recorded",
//             request: {
//               id: request.id,
//               user_id: request.user_id,
//               stock_id: request.stock_id,
//               item_name: request.item_name,
//               quantity: request.quantity,
//               priority: request.priority,
//               reason: request.reason,
//               status: request.status,
//               blockchain_address: request.blockchain_address,
//               created_at: request.created_at,
//               updated_at: request.updated_at,
//             },
//             transaction: {
//               id: transaction.id,
//               transaction_id: transaction.transaction_id,
//               block_number: transaction.block_number,
//               status: transaction.status,
//               user_id: transaction.user_id,
//               stock_id: transaction.stock_id,
//               created_at: transaction.created_at,
//               updated_at: transaction.updated_at,
//             },
//           });
//         }
//       }
//     }

//     // Fallback response if blockchain transaction fails or not applicable
//     res.status(200).json({
//       message: "Request status updated",
//       request: {
//         id: request.id,
//         user_id: request.user_id,
//         stock_id: request.stock_id,
//         item_name: request.item_name,
//         quantity: request.quantity,
//         priority: request.priority,
//         reason: request.reason,
//         status: request.status,
//         blockchain_address: request.blockchain_address,
//         created_at: request.created_at,
//         updated_at: request.updated_at,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error in EditRequest" });
//   }
// };

// // Get all requests (unchanged)
// const ManageRequest = async (req, res) => {
//   try {
//     const requests = await Request.findAll({ where: { user_id: req.user.id } });
//     res.status(200).json({ requests });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error in ManageRequest" });
//   }
// };

// // Get all requests (unchanged)
// const GetAllRequests = async (req, res) => {
//   try {
//     const requests = await Request.findAll();
//     res.status(200).json({ requests });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error in GetAllRequests" });
//   }
// };

// // Get a single request (unchanged)
// const GetSingleRequest = async (req, res) => {
//   try {
//     const request = await Request.findByPk(req.params.id);
//     if (!request) return res.status(404).json({ error: "Request not found" });
//     res.status(200).json({ request });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error in GetSingleRequest" });
//   }
// };

// // Delete a request (unchanged)
// const DeleteRequest = async (req, res) => {
//   try {
//     const request = await Request.findByPk(req.params.id);
//     if (!request) return res.status(404).json({ error: "Request not found" });

//     await request.destroy();
//     res.status(200).json({ message: "Request deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error in DeleteRequest" });
//   }
// };

// module.exports = {
//   MakeRequest,
//   ManageRequest,
//   GetAllRequests,
//   GetSingleRequest,
//   EditRequest,
//   DeleteRequest,
// };

//fixed controller
const Request = require("../models/requests");
const Blockchain = require("../models/blockchain");
const User = require("../models/users");
const Web3Service = require("../blockchain/Web3Service");
const { v4: uuidv4 } = require("uuid");

// Make a request with blockchain integration
const MakeRequest = async (req, res) => {
  try {
    const {
      user_id,
      stock_id,
      item_name,
      quantity,
      priority,
      reason,
      department,
    } = req.body;

    const blockchain_address = uuidv4();

    // Create request in database
    const request = await Request.create({
      user_id,
      stock_id,
      item_name,
      quantity,
      priority: priority || "LOW",
      reason: reason || null,
      department,
      blockchain_address,
    });

    let blockchainSuccess = false;

    // Create blockchain transaction
    const user = await User.findByPk(user_id);
    if (user && user.blockchain_address) {
      const privateKey = Web3Service.decryptPrivateKey(
        user.encrypted_private_key
      );

      if (privateKey) {
        const blockchainResult = await Web3Service.createRequestOnChain(
          item_name,
          quantity,
          priority || "LOW",
          reason || "",
          user.blockchain_address,
          privateKey
        );

        if (blockchainResult && blockchainResult.success) {
          blockchainSuccess = true;

          const lastBlock = await Blockchain.findOne({
            order: [["block_number", "DESC"]],
          });
          const nextBlockNumber = lastBlock ? lastBlock.block_number + 1 : 1;

          await Blockchain.create({
            transaction_id: blockchainResult.transactionHash,
            request_id: request.id,
            block_number: nextBlockNumber,
            status: "PENDING",
            user_id: user_id,
            stock_id: stock_id,
          });
        }
      }
    }

    return res.status(201).json({
      status: "success",
      message: "Request created successfully",
      blockchain_success: blockchainSuccess,
      data: request,
    });
  } catch (error) {
    console.error("Error in MakeRequest:", error);
    return res.status(500).json({ status: "error", error: error.message });
  }
};

// Edit a request with blockchain approval
const EditRequest = async (req, res) => {
  try {
    // 1. Find the request by ID
    const request = await Request.findByPk(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });

    const { status } = req.body;
    if (!status)
      return res.status(400).json({ error: "New status must be provided" });

    // 2. Update request status
    await request.update({ status });

    // 3. Determine next block_number
    const lastBlock = await Blockchain.findOne({
      order: [["block_number", "DESC"]],
    });
    const nextBlockNumber = lastBlock ? lastBlock.block_number + 1 : 1;

    // 4. Record blockchain transaction
    const transaction = await Blockchain.create({
      transaction_id: uuidv4(),
      request_id: request.id,
      block_number: nextBlockNumber,
      status,
      user_id: request.user_id,
      stock_id: request.stock_id,
    });

    // 5. Return response
    res.status(200).json({
      message: "Request status updated and transaction recorded",
      request: {
        id: request.id,
        user_id: request.user_id,
        stock_id: request.stock_id,
        item_name: request.item_name,
        quantity: request.quantity,
        priority: request.priority,
        reason: request.reason,
        status: request.status,
        blockchain_address: request.blockchain_address,
        created_at: request.created_at,
        updated_at: request.updated_at,
      },
      transaction: {
        id: transaction.id,
        transaction_id: transaction.transaction_id,
        block_number: transaction.block_number,
        status: transaction.status,
        user_id: transaction.user_id,
        stock_id: transaction.stock_id,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in EditRequest" });
  }
};

// Manage requests
const ManageRequest = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);
    if (!request)
      return res
        .status(404)
        .json({ status: "error", error: "Request not found" });

    const { status, approval_reason } = req.body;
    if (!status) {
      return res
        .status(400)
        .json({ status: "error", error: "New status must be provided" });
    }

    await request.update({ status });

    const approver = await User.findByPk(req.user.id);
    let transaction = null;

    if (
      approver &&
      approver.blockchain_address &&
      (status === "APPROVED" || status === "REJECTED")
    ) {
      const privateKey = Web3Service.decryptPrivateKey(
        approver.encrypted_private_key
      );

      if (privateKey) {
        const blockchainResult = await Web3Service.approveRequestOnChain(
          request.id,
          status === "APPROVED",
          approval_reason || "No reason provided",
          approver.blockchain_address,
          privateKey
        );

        if (blockchainResult && blockchainResult.success) {
          const lastBlock = await Blockchain.findOne({
            order: [["block_number", "DESC"]],
          });
          const nextBlockNumber = lastBlock ? lastBlock.block_number + 1 : 1;

          transaction = await Blockchain.create({
            transaction_id: blockchainResult.transactionHash,
            request_id: request.id,
            block_number: nextBlockNumber,
            status: status,
            user_id: request.user_id,
            stock_id: request.stock_id,
          });
        }
      }
    }

    return res.status(200).json({
      status: "success",
      message: transaction
        ? "Request status updated and blockchain transaction recorded"
        : "Request status updated",
      request,
      transaction,
    });
  } catch (error) {
    console.error("Error in EditRequest:", error);
    return res.status(500).json({ status: "error", error: error.message });
  }
};

// Get all requests
const GetAllRequests = async (req, res) => {
  try {
    const requests = await Request.findAll();
    return res.status(200).json({ status: "success", data: requests });
  } catch (error) {
    console.error("Error in GetAllRequests:", error);
    return res.status(500).json({ status: "error", error: error.message });
  }
};

// Get single request
const GetSingleRequest = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);
    if (!request)
      return res
        .status(404)
        .json({ status: "error", error: "Request not found" });
    return res.status(200).json({ status: "success", data: request });
  } catch (error) {
    console.error("Error in GetSingleRequest:", error);
    return res.status(500).json({ status: "error", error: error.message });
  }
};

// Delete request
const DeleteRequest = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);
    if (!request)
      return res
        .status(404)
        .json({ status: "error", error: "Request not found" });

    await request.destroy();
    return res
      .status(200)
      .json({ status: "success", message: "Request deleted successfully" });
  } catch (error) {
    console.error("Error in DeleteRequest:", error);
    return res.status(500).json({ status: "error", error: error.message });
  }
};

// Get all requests and grouped by department & user
const GetGroupedRequests = async (req, res) => {
  try {
    const requests = await Request.findAll({ raw: true }); // raw for plain objects

    // Group by department and then by user_id
    const grouped = requests.reduce((acc, request) => {
      const dept = request.department || "Unknown";
      const userId = request.user_id;

      if (!acc[dept]) acc[dept] = {};
      if (!acc[dept][userId]) acc[dept][userId] = [];

      acc[dept][userId].push(request);

      return acc;
    }, {});

    return res.status(200).json({
      status: "success",
      allRequests: requests,
      groupedRequests: grouped,
    });
  } catch (error) {
    console.error("Error in GetGroupedRequests:", error);
    return res.status(500).json({ status: "error", error: error.message });
  }
};

module.exports = {
  MakeRequest,
  ManageRequest,
  GetAllRequests,
  GetGroupedRequests,
  GetSingleRequest,
  EditRequest,
  DeleteRequest,
};
