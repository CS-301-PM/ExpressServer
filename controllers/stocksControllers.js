const Stock = require("../models/stocks");
const Web3Service = require("../blockchain/Web3Service");

// Add new stock
const AddStock = async (req, res) => {
  try {
    const {
      item_name,
      original_quantity,
      current_quantity,
      cost_each,
      curr_location,
      location_reason,
      available,
      category,
    } = req.body;

    if (!item_name || !original_quantity || !current_quantity || !cost_each) {
      return res.status(400).json({
        error:
          "item_name, original_quantity, current_quantity and cost_each are required",
      });
    }

    const stock = await Stock.create({
      item_name,
      original_quantity,
      current_quantity,
      cost_each,
      prev_location: null,
      curr_location: curr_location || null,
      location_reason: location_reason || null,
      available: available !== undefined ? available : true,
      category: category || null,
    });

    // Propose on-chain log for stock creation
    try {
      const logPayload = {
        stockId: stock.id,
        itemName: stock.item_name,
        originalQuantity: stock.original_quantity,
        currentQuantity: stock.current_quantity,
        costEach: stock.cost_each,
        currLocation: stock.curr_location,
        prevLocation: stock.prev_location,
        available: stock.available,
        category: stock.category,
        timestamp: new Date().toISOString(),
      };
      await Web3Service.loggerProposeAsNode("STOCK_ADDED", JSON.stringify(logPayload));
    } catch (_) {}

    res.status(201).json({
      message: "Stock added successfully",
      stock,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in AddStock" });
  }
};

// Get all stocks
const GetAllStocks = async (req, res) => {
  try {
    const stocks = await Stock.findAll();
    res.status(200).json({ stocks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in GetAllStocks" });
  }
};

const GetAllStocksAvailable = async (req, res) => {
  try {
    const stocks = await Stock.findAll({
      where: {
        available: true,
      },
    });
    res.status(200).json({ stocks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in GetAllStocksAvailable" });
  }
};

// Edit stock (only update status fields and location changes)
const EditStock = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Optionally remove created_at to avoid overriding
    delete updates.created_at;

    const stock = await Stock.findByPk(id);
    if (!stock) return res.status(404).json({ error: "Stock not found" });

    // Handle location changes
    if (
      updates.curr_location &&
      updates.curr_location !== stock.curr_location
    ) {
      updates.prev_location = stock.curr_location;
      stock.location_reason = updates.location_reason || stock.location_reason;
    }

    updates.updated_at = new Date();

    await stock.update(updates);

    // Propose on-chain log for stock update
    try {
      const changed = {};
      for (const k of Object.keys(updates)) {
        if (["created_at", "updated_at"].includes(k)) continue;
        changed[k] = updates[k];
      }
      const logPayload = {
        stockId: stock.id,
        changed,
        timestamp: new Date().toISOString(),
      };
      await Web3Service.loggerProposeAsNode("STOCK_UPDATED", JSON.stringify(logPayload));
    } catch (_) {}

    res.status(200).json({
      message: "Stock updated successfully",
      stock,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in EditStock" });
  }
};

// Delete stock
const DeleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    const stock = await Stock.findByPk(id);
    if (!stock) return res.status(404).json({ error: "Stock not found" });

    await stock.destroy();

    // Propose on-chain log for stock deletion
    try {
      const logPayload = {
        stockId: stock.id,
        itemName: stock.item_name,
        timestamp: new Date().toISOString(),
      };
      await Web3Service.loggerProposeAsNode("STOCK_DELETED", JSON.stringify(logPayload));
    } catch (_) {}

    res.status(200).json({
      message: "Stock deleted successfully",
      stock,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in DeleteStock" });
  }
};


module.exports = {
  AddStock,
  GetAllStocks,
  GetAllStocksAvailable,
  EditStock,
  DeleteStock,
};
