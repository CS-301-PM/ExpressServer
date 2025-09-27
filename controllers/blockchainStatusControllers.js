// Import Web3Service (make sure Web3Service exports { providerUrl, isConnected })
const Web3Service = require("../blockchain/Web3Service");

// Health check controller
async function Healthy(req, res) {
  try {
    const status = {
      status: "OK",
      timestamp: new Date().toISOString(),
      provider: Web3Service.providerUrl,
      connected: await Web3Service.isConnected(),
      contracts: {
        userManager: process.env.USER_MANAGER_ADDRESS || null,
        stockManager: process.env.STOCK_MANAGER_ADDRESS || null,
        requestManager: process.env.REQUEST_MANAGER_ADDRESS || null,

        // Node-specific (if multiple deployments per node)
        userManager_node2: process.env.USER_MANAGER_ADDRESS_NODE2 || null,
        stockManager_node2: process.env.STOCK_MANAGER_ADDRESS_NODE2 || null,
        requestManager_node2: process.env.REQUEST_MANAGER_ADDRESS_NODE2 || null,

        userManager_node3: process.env.USER_MANAGER_ADDRESS_NODE3 || null,
        stockManager_node3: process.env.STOCK_MANAGER_ADDRESS_NODE3 || null,
        requestManager_node3: process.env.REQUEST_MANAGER_ADDRESS_NODE3 || null,
      },
    };

    res.json(status);
  } catch (err) {
    res.status(500).json({
      status: "ERROR",
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = {
  Healthy,
};
