const Request = require("../models/requests");
const Blockchain = require("../models/blockchain");
const { v4: uuidv4 } = require("uuid"); // for generating unique transaction IDs

// Make a request
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

    const blockchain_address = uuidv4(); // generate unique blockchain id

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

    res.status(201).json({ message: "Request created successfully", request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in MakeRequest" });
  }
};

module.exports = { MakeRequest };

// Manage requests (could be all requests for a specific user)
const ManageRequest = async (req, res) => {
  try {
    const requests = await Request.findAll({ where: { user_id: req.user.id } });
    res.status(200).json({ requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in ManageRequest" });
  }
};

// Get all requests
const GetAllRequests = async (req, res) => {
  try {
    const requests = await Request.findAll();
    res.status(200).json({ requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in GetAllRequests" });
  }
};

// Get a single request
const GetSingleRequest = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });
    res.status(200).json({ request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in GetSingleRequest" });
  }
};

// Edit a request
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

// Delete a request
const DeleteRequest = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });

    await request.destroy();
    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in DeleteRequest" });
  }
};

module.exports = {
  MakeRequest,
  ManageRequest,
  GetAllRequests,
  GetSingleRequest,
  EditRequest,
  DeleteRequest,
};
