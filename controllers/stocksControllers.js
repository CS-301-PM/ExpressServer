// Controllers/StockControllers.js
const Stock = require("../models/stocks");

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

// Get single stock
const GetSingleStock = async (req, res) => {
  try {
    const { id } = req.params;
    const stock = await Stock.findByPk(id);
    if (!stock) return res.status(404).json({ error: "Stock not found" });

    res.status(200).json({ stock });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in GetSingleStock" });
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
  GetSingleStock,
  EditStock,
  DeleteStock,
};
