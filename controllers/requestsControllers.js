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

    const blockchain_address = "";

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
        const blockchainResult = await Web3Service.requestCreate(
          item_name,
          quantity,
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

    // 6. Propose a log entry to the on-chain GenericLogger (category: REQUEST_CREATED)
    try {
      const logPayload = {
        requestId: request.id,
        userId: user_id,
        stockId: stock_id,
        itemName: item_name,
        quantity,
        priority: priority || "LOW",
        reason: reason || null,
        department,
        status: "PENDING",
        timestamp: new Date().toISOString(),
      };
      await Web3Service.loggerProposeAsNode(
        "REQUEST_CREATED",
        JSON.stringify(logPayload)
      );
    } catch (_) {}

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
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // 2. Safely get status from body
    const { status } = req.body || {};
    if (!status) {
      return res.status(400).json({ error: "New status must be provided" });
    }

    // 3. Update request status
    await request.update({ status });

    // 4. Determine next block_number
    const lastBlock = await Blockchain.findOne({
      order: [["block_number", "DESC"]],
    });
    const nextBlockNumber = lastBlock ? lastBlock.block_number + 1 : 1;

    // 5. Record blockchain transaction
    const transaction = await Blockchain.create({
      transaction_id: uuidv4(),
      request_id: request.id,
      block_number: nextBlockNumber,
      status,
      user_id: request.user_id,
      stock_id: request.stock_id,
    });

    // 6. Propose a log entry to the on-chain GenericLogger
    try {
      const logPayload = {
        requestId: request.id,
        userId: request.user_id,
        stockId: request.stock_id,
        status: request.status,
        timestamp: new Date().toISOString(),
      };
      await Web3Service.loggerProposeAsNode(
        "REQUEST_STATUS",
        JSON.stringify(logPayload)
      );
    } catch (err) {
      console.warn("⚠️ Logger propose failed:", err.message);
    }

    // 7. Return response
    return res.status(200).json({
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
    return res.status(500).json({ error: "Server error in EditRequest" });
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

// // Manage requests
// const ManageRequest = async (req, res) => {
//   try {
//     const request = await Request.findByPk(req.params.id);
//     if (!request)
//       return res
//         .status(404)
//         .json({ status: "error", error: "Request not found" });

//     const { status, approval_reason } = req.body;
//     if (!status) {
//       return res
//         .status(400)
//         .json({ status: "error", error: "New status must be provided" });
//     }

//     await request.update({ status });

//     const approver = await User.findByPk(req.user.id);
//     let transaction = null;

//     if (
//       approver &&
//       approver.blockchain_address &&
//       (status === "APPROVED" || status === "REJECTED")
//     ) {
//       const privateKey = Web3Service.decryptPrivateKey(
//         approver.encrypted_private_key
//       );

//       if (privateKey) {
//         const blockchainResult = await Web3Service.requestApprove(
//           request.id,
//           status,
//           approver.blockchain_address,
//           privateKey
//         );

//         if (blockchainResult && blockchainResult.success) {
//           const lastBlock = await Blockchain.findOne({
//             order: [["block_number", "DESC"]],
//           });
//           const nextBlockNumber = lastBlock ? lastBlock.block_number + 1 : 1;

//           transaction = await Blockchain.create({
//             transaction_id: blockchainResult.transactionHash,
//             request_id: request.id,
//             block_number: nextBlockNumber,
//             status: status,
//             user_id: request.user_id,
//             stock_id: request.stock_id,
//           });
//         }
//       }
//     }

//     // Propose a log entry for this status change as well
//     try {
//       const logPayload = {
//         requestId: request.id,
//         userId: request.user_id,
//         stockId: request.stock_id,
//         status,
//         approverId: req.user?.id || null,
//         approval_reason: approval_reason || null,
//         timestamp: new Date().toISOString(),
//       };
//       await Web3Service.loggerProposeAsNode(
//         "REQUEST_STATUS",
//         JSON.stringify(logPayload)
//       );
//     } catch (_) {}

//     return res.status(200).json({
//       status: "success",
//       message: transaction
//         ? "Request status updated and blockchain transaction recorded"
//         : "Request status updated",
//       request,
//       transaction,
//     });
//   } catch (error) {
//     console.error("Error in EditRequest:", error);
//     return res.status(500).json({ status: "error", error: error.message });
//   }
// };
// Get single request
// const GetSingleRequest = async (req, res) => {
//   try {
//     const request = await Request.findByPk(req.params.id);
//     if (!request)
//       return res
//         .status(404)
//         .json({ status: "error", error: "Request not found" });
//     return res.status(200).json({ status: "success", data: request });
//   } catch (error) {
//     console.error("Error in GetSingleRequest:", error);
//     return res.status(500).json({ status: "error", error: error.message });
//   }
// };
// // Delete request
// const DeleteRequest = async (req, res) => {
//   try {
//     const request = await Request.findByPk(req.params.id);
//     if (!request)
//       return res
//         .status(404)
//         .json({ status: "error", error: "Request not found" });

//     await request.destroy();
//     return res
//       .status(200)
//       .json({ status: "success", message: "Request deleted successfully" });
//   } catch (error) {
//     console.error("Error in DeleteRequest:", error);
//     return res.status(500).json({ status: "error", error: error.message });
//   }
// };
// // Get all requests and grouped by department & user
// const GetGroupedRequests = async (req, res) => {
//   try {
//     const requests = await Request.findAll({ raw: true }); // raw for plain objects

//     // Group by department and then by user_id
//     const grouped = requests.reduce((acc, request) => {
//       const dept = request.department || "Unknown";
//       const userId = request.user_id;

//       if (!acc[dept]) acc[dept] = {};
//       if (!acc[dept][userId]) acc[dept][userId] = [];

//       acc[dept][userId].push(request);

//       return acc;
//     }, {});

//     return res.status(200).json({
//       status: "success",
//       allRequests: requests,
//       groupedRequests: grouped,
//     });
//   } catch (error) {
//     console.error("Error in GetGroupedRequests:", error);
//     return res.status(500).json({ status: "error", error: error.message });
//   }
// };

module.exports = {
  MakeRequest,
  EditRequest,
  GetAllRequests,
  // ManageRequest,
  // GetGroupedRequests,
  // GetSingleRequest,
  // DeleteRequest,
};
