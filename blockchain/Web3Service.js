require("dotenv").config();
const { Web3 } = require("web3");
const crypto = require("crypto");

class Web3Service {
  constructor() {
    const providerCandidates = [
      process.env.WEB3_PROVIDER_URI,
      "http://127.0.0.1:8501",
      "http://127.0.0.1:8502",
      "http://127.0.0.1:8503",
    ].filter(Boolean);
    this.providerUrl = providerCandidates[1];
    this.web3 = new Web3(this.providerUrl);
    this.connected = false;

    // Try to connect to available providers
    (async () => {
      for (const url of providerCandidates) {
        try {
          const probe = new Web3(url);
          await probe.eth.getChainId();
          this.web3 = probe;
          this.providerUrl = url;
          this._initContracts();
          this.connected = true;
          break;
        } catch (_) {}
      }
    })();

    // Contract addresses
    this.userManagerAddress =
      process.env.USER_MANAGER_ADDRESS || process.env.CONTRACT_ADDRESS_USER;
    this.stockManagerAddress =
      process.env.STOCK_MANAGER_ADDRESS || process.env.CONTRACT_ADDRESS_STOCK;
    this.requestManagerAddress =
      process.env.REQUEST_MANAGER_ADDRESS ||
      process.env.CONTRACT_ADDRESS_REQUEST;
    this.loggerAddress = process.env.GENERIC_LOGGER_ADDRESS;

    // Load ABIs
    try {
      this.userManagerAbi =
        require("../artifacts/contracts/UserManager.sol/UserManager.json").abi;
    } catch (_) {
      this.userManagerAbi = null;
    }
    try {
      this.stockManagerAbi =
        require("../artifacts/contracts/StockManager.sol/StockManager.json").abi;
    } catch (_) {
      this.stockManagerAbi = null;
    }
    try {
      this.requestManagerAbi =
        require("../artifacts/contracts/RequestManager.sol/RequestManager.json").abi;
    } catch (_) {
      this.requestManagerAbi = null;
    }
    try {
      this.loggerAbi =
        require("../artifacts/contracts/ActionMnager.sol/GenericLoggerPeerApproved.json").abi;
    } catch (_) {
      this.loggerAbi = null;
    }

    this.contract = null;
    this.abi = this.getContractABI();

    // Initialize contracts with current provider
    this._initContracts();
  }

  _initContracts() {
    try {
      this.userManager = undefined;
      this.stockManager = undefined;
      this.requestManager = undefined;
      this.logger = undefined;
      if (this.userManagerAbi && this.userManagerAddress)
        this.userManager = new this.web3.eth.Contract(
          this.userManagerAbi,
          this.userManagerAddress
        );
      if (this.stockManagerAbi && this.stockManagerAddress)
        this.stockManager = new this.web3.eth.Contract(
          this.stockManagerAbi,
          this.stockManagerAddress
        );
      if (this.requestManagerAbi && this.requestManagerAddress) {
        this.requestManager = new this.web3.eth.Contract(
          this.requestManagerAbi,
          this.requestManagerAddress
        );
        if (!this.contract) {
          this.contract = this.requestManager;
          this.contractAddress = this.requestManagerAddress;
          this.abi = this.requestManagerAbi;
        }
      }
      if (this.loggerAbi && this.loggerAddress) {
        this.logger = new this.web3.eth.Contract(
          this.loggerAbi,
          this.loggerAddress
        );
      }
    } catch (_) {}
  }

  getContractABI() {
    return [
      {
        inputs: [],
        name: "getContractInfo",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "user", type: "address" },
          { internalType: "string", name: "role", type: "string" },
          { internalType: "bool", name: "status", type: "bool" },
        ],
        name: "assignRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "string", name: "itemName", type: "string" },
          { internalType: "uint256", name: "quantity", type: "uint256" },
          { internalType: "string", name: "priority", type: "string" },
          { internalType: "string", name: "reason", type: "string" },
        ],
        name: "createRequest",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "requestId", type: "uint256" },
          { internalType: "bool", name: "approved", type: "bool" },
          { internalType: "string", name: "reason", type: "string" },
        ],
        name: "approveRequest",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "string", name: "itemName", type: "string" },
          { internalType: "int256", name: "quantityChange", type: "int256" },
          { internalType: "string", name: "reason", type: "string" },
        ],
        name: "adjustStock",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ];
  }

  isConnected() {
    return !!this.connected;
  }

  async generateBlockchainAccount() {
    const account = this.web3.eth.accounts.create();
    return { address: account.address, privateKey: account.privateKey };
  }

  encryptPrivateKey(privateKey) {
    const algorithm = "aes-256-gcm";
    const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    cipher.setAAD(Buffer.from("CBUStores"));

    let encrypted = cipher.update(privateKey, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      iv: iv.toString("hex"),
      data: encrypted,
      authTag: authTag.toString("hex"),
    });
  }

  decryptPrivateKey(encryptedData) {
    if (!encryptedData) return null;
    try {
      const algorithm = "aes-256-gcm";
      const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
      const data = JSON.parse(encryptedData);

      const decipher = crypto.createDecipheriv(
        algorithm,
        key,
        Buffer.from(data.iv, "hex")
      );
      decipher.setAAD(Buffer.from("CBUStores"));
      decipher.setAuthTag(Buffer.from(data.authTag, "hex"));

      let decrypted = decipher.update(data.data, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch (error) {
      console.error("Decryption error:", error);
      return null;
    }
  }

  async sendTransaction(method, fromAddress, privateKey, params = []) {
    try {
      const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
      this.web3.eth.accounts.wallet.add(account);

      // Rely on node/provider for gas estimation to avoid BigInt/number mixing across libs
      const tx = method(...params);
      const result = await tx.send({ from: fromAddress });
      return { success: true, transactionHash: result.transactionHash };
    } catch (error) {
      console.error("Transaction failed:", error);
      return { success: false, error: error.message };
    }
  }

  // ---------- BLOCKCHAIN ACTION METHODS (aligned to contracts) ----------
  // UserManager
  async userSignup(name, fromAddress, privateKey) {
    if (!this.userManager)
      return { success: false, error: "UserManager not initialized" };
    return this.sendTransaction(
      this.userManager.methods.signup,
      fromAddress,
      privateKey,
      [name]
    );
  }

  async userSignin(fromAddress, privateKey) {
    if (!this.userManager)
      return { success: false, error: "UserManager not initialized" };
    return this.sendTransaction(
      this.userManager.methods.signin,
      fromAddress,
      privateKey,
      []
    );
  }

  async userSignout(fromAddress, privateKey) {
    if (!this.userManager)
      return { success: false, error: "UserManager not initialized" };
    return this.sendTransaction(
      this.userManager.methods.signout,
      fromAddress,
      privateKey,
      []
    );
  }

  async userApproveDelete(targetUserAddress, fromAddress, privateKey) {
    if (!this.userManager)
      return { success: false, error: "UserManager not initialized" };
    return this.sendTransaction(
      this.userManager.methods.approveDelete,
      fromAddress,
      privateKey,
      [targetUserAddress]
    );
  }

  // StockManager
  async stockPropose(name, quantity, fromAddress, privateKey) {
    if (!this.stockManager)
      return { success: false, error: "StockManager not initialized" };
    return this.sendTransaction(
      this.stockManager.methods.proposeStock,
      fromAddress,
      privateKey,
      [name, String(quantity)]
    );
  }

  async stockApprove(id, fromAddress, privateKey) {
    if (!this.stockManager)
      return { success: false, error: "StockManager not initialized" };
    return this.sendTransaction(
      this.stockManager.methods.approveStock,
      fromAddress,
      privateKey,
      [String(id)]
    );
  }

  async stockUpdate(id, name, quantity, fromAddress, privateKey) {
    if (!this.stockManager)
      return { success: false, error: "StockManager not initialized" };
    return this.sendTransaction(
      this.stockManager.methods.updateStock,
      fromAddress,
      privateKey,
      [String(id), name, String(quantity)]
    );
  }

  async stockDelete(id, fromAddress, privateKey) {
    if (!this.stockManager)
      return { success: false, error: "StockManager not initialized" };
    return this.sendTransaction(
      this.stockManager.methods.deleteStock,
      fromAddress,
      privateKey,
      [String(id)]
    );
  }

  // Logger
  _getLoggerNodeUrls() {
    // Prefer explicit env configuration, fallback to known ports
    const raw = process.env.LOGGER_NODE_URLS;
    if (raw) {
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [
      "http://127.0.0.1:8501",
      "http://127.0.0.1:8502",
      "http://127.0.0.1:8503",
    ];
  }

  _decodeEntryIdFromReceipt(receipt) {
    try {
      const eventAbi = (this.loggerAbi || []).find(
        (e) => e.type === "event" && e.name === "EntryProposed"
      );
      const sig = this.web3.utils.keccak256(
        `${eventAbi.name}(${eventAbi.inputs.map((i) => i.type).join(",")})`
      );
      const log = (receipt.logs || []).find(
        (l) =>
          l.address?.toLowerCase() ===
            this.logger.options.address.toLowerCase() &&
          l.topics &&
          l.topics[0] &&
          l.topics[0].toLowerCase() === sig.toLowerCase()
      );
      if (log && log.topics && log.topics[1]) {
        // topics[1] is indexed uint256 entryId
        const entryId = this.web3.utils.hexToNumberString(log.topics[1]);
        return entryId;
      }
    } catch (_) {}
    return null;
  }

  async _getLastProposedEntryIdFallback() {
    try {
      const nextId = await this.logger.methods.nextEntryId().call();
      // entryId = nextId - 1
      return this.web3.utils
        .toBN(nextId)
        .sub(this.web3.utils.toBN(1))
        .toString();
    } catch (_) {
      return null;
    }
  }

  async _autoApproveEntry(entryId) {
    const wantAuto =
      String(process.env.AUTO_APPROVE_LOGGER || "true").toLowerCase() ===
      "true";
    if (!wantAuto) return { approvals: 0, details: [] };

    const urls = this._getLoggerNodeUrls();
    const details = [];
    let approvals = 0;

    for (const url of urls) {
      try {
        const w3 = new Web3(url);
        const accts = await w3.eth.getAccounts();
        if (!accts || !accts.length) {
          details.push({ url, ok: false, error: "no accounts" });
          continue;
        }
        const inst = new w3.eth.Contract(this.loggerAbi, this.loggerAddress);
        await inst.methods
          .approveEntry(String(entryId))
          .send({ from: accts[0] });
        approvals += 1;
        details.push({ url, ok: true });
        if (approvals >= 2) break; // 2-of-3
      } catch (e) {
        details.push({ url, ok: false, error: e?.message || String(e) });
      }
    }
    return { approvals, details };
  }

  async loggerPropose(category, data, fromAddress, privateKey) {
    if (!this.logger)
      return { success: false, error: "Logger not initialized" };
    try {
      const txResult = await this.sendTransaction(
        this.logger.methods.proposeEntry,
        fromAddress,
        privateKey,
        [category, data]
      );
      if (!txResult.success) return txResult;

      // Try extract entryId from pending state (fallback to nextEntryId-1)
      let entryId = null;
      try {
        const receipt = await this.web3.eth.getTransactionReceipt(
          txResult.transactionHash
        );
        entryId = this._decodeEntryIdFromReceipt(receipt);
      } catch (_) {}
      if (!entryId) entryId = await this._getLastProposedEntryIdFallback();

      const auto = await this._autoApproveEntry(entryId);
      return { ...txResult, entryId, auto };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loggerProposeAsNode(category, data) {
    if (!this.logger)
      return { success: false, error: "Logger not initialized" };
    const accounts = await this.web3.eth.getAccounts();
    if (!accounts || !accounts.length)
      return { success: false, error: "No unlocked accounts available" };
    try {
      const receipt = await this.logger.methods
        .proposeEntry(category, data)
        .send({ from: accounts[0] });

      let entryId = this._decodeEntryIdFromReceipt(receipt);
      if (!entryId) entryId = await this._getLastProposedEntryIdFallback();
      const auto = await this._autoApproveEntry(entryId);

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        entryId,
        auto,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loggerApprove(entryId, fromAddress, privateKey) {
    if (!this.logger)
      return { success: false, error: "Logger not initialized" };
    return this.sendTransaction(
      this.logger.methods.approveEntry,
      fromAddress,
      privateKey,
      [String(entryId)]
    );
  }

  async loggerApproveAsNode(entryId) {
    if (!this.logger)
      return { success: false, error: "Logger not initialized" };
    const accounts = await this.web3.eth.getAccounts();
    if (!accounts || !accounts.length)
      return { success: false, error: "No unlocked accounts available" };
    try {
      const receipt = await this.logger.methods
        .approveEntry(String(entryId))
        .send({ from: accounts[0] });
      return { success: true, transactionHash: receipt.transactionHash };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loggerGetAllEntries() {
    if (!this.logger)
      return { success: false, error: "Logger not initialized" };
    try {
      const entries = await this.logger.methods.getAllEntries().call();
      return { success: true, entries };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loggerGetEntriesByCategory(category) {
    if (!this.logger)
      return { success: false, error: "Logger not initialized" };
    if (!category || typeof category !== "string")
      return { success: false, error: "category must be a string" };
    try {
      const entries = await this.logger.methods
        .getEntriesByCategory(category)
        .call();
      return { success: true, entries };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loggerGetEntriesByProposer(proposer) {
    if (!this.logger)
      return { success: false, error: "Logger not initialized" };
    if (!proposer) return { success: false, error: "proposer is required" };
    try {
      const entries = await this.logger.methods
        .getEntriesByProposer(proposer)
        .call();
      return { success: true, entries };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loggerGetEntriesByTimeRange(startTime, endTime) {
    if (!this.logger)
      return { success: false, error: "Logger not initialized" };
    try {
      const s = String(startTime ?? 0);
      const e = String(endTime ?? 0);
      const entries = await this.logger.methods
        .getEntriesByTimeRange(s, e)
        .call();
      return { success: true, entries };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loggerGetRecentEntries(count) {
    if (!this.logger)
      return { success: false, error: "Logger not initialized" };
    try {
      const c = String(count ?? 10);
      const entries = await this.logger.methods.getRecentEntries(c).call();
      return { success: true, entries };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loggerGetTotalEntryCount() {
    if (!this.logger)
      return { success: false, error: "Logger not initialized" };
    try {
      const count = await this.logger.methods.getTotalEntryCount().call();
      return { success: true, count };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loggerGetEntryByIndex(index) {
    if (!this.logger)
      return { success: false, error: "Logger not initialized" };
    try {
      const i = String(index);
      const entry = await this.logger.methods.getEntryByIndex(i).call();
      return { success: true, entry };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loggerGetPendingEntry(entryId) {
    if (!this.logger)
      return { success: false, error: "Logger not initialized" };
    try {
      const id = String(entryId);
      const entry = await this.logger.methods.getPendingEntry(id).call();
      return { success: true, entry };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loggerGetApprovalStatus(entryId) {
    if (!this.logger)
      return { success: false, error: "Logger not initialized" };
    try {
      const id = String(entryId);
      const out = await this.logger.methods.getApprovalStatus(id).call();
      // out = { currentApprovals, peerApprovals }
      return { success: true, ...out };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // RequestManager
  async requestCreate(itemName, quantity, fromAddress, privateKey) {
    if (!this.requestManager)
      return { success: false, error: "RequestManager not initialized" };
    return this.sendTransaction(
      this.requestManager.methods.createRequest,
      fromAddress,
      privateKey,
      [itemName, String(quantity)]
    );
  }

  async requestApprove(requestId, newStatus, fromAddress, privateKey) {
    if (!this.requestManager)
      return { success: false, error: "RequestManager not initialized" };
    const statusCode = this._mapStatus(newStatus);
    return this.sendTransaction(
      this.requestManager.methods.approveRequest,
      fromAddress,
      privateKey,
      [String(requestId), statusCode]
    );
  }

  async requestApproveAsPeer(requestId, newStatus) {
    if (!this.requestManager)
      return { success: false, error: "RequestManager not initialized" };
    const accounts = await this.web3.eth.getAccounts();
    if (!accounts || !accounts.length)
      return { success: false, error: "No unlocked accounts available" };
    const from = accounts[0];
    const statusCode = this._mapStatus(newStatus);
    try {
      const receipt = await this.requestManager.methods
        .approveRequest(String(requestId), statusCode)
        .send({ from });
      return { success: true, transactionHash: receipt.transactionHash };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  _mapStatus(val) {
    if (typeof val === "boolean") return val ? 1 : 2; // APPROVED:1, REJECTED:2
    if (typeof val === "string") {
      const t = val.toUpperCase();
      if (t === "PENDING") return 0;
      if (t === "APPROVED") return 1;
      if (t === "REJECTED") return 2;
      if (t === "IN_PROGRESS") return 3;
      if (t === "FULFILLED") return 4;
    }
    const n = Number(val);
    if (!Number.isNaN(n) && n >= 0 && n <= 4) return n;
    return 0;
  }

  // Backward compatible aliases
  async createRequestOnChain(
    itemName,
    quantity,
    _priority,
    _reason,
    fromAddress,
    privateKey
  ) {
    return this.requestCreate(itemName, quantity, fromAddress, privateKey);
  }

  async approveRequestOnChain(
    requestId,
    approvedOrStatus,
    _reason,
    fromAddress,
    privateKey
  ) {
    return this.requestApprove(
      requestId,
      approvedOrStatus,
      fromAddress,
      privateKey
    );
  }

  async assignRoleOnChain() {
    return {
      success: false,
      error: "assignRoleOnChain not supported by current contracts",
    };
  }

  // ---------- GET LOGS FROM CHAIN ----------
  async getLogs(contractType, fromBlock = 0, toBlock = "latest") {
    let targetContract;
    if (contractType === "user") targetContract = this.userManager;
    else if (contractType === "stock") targetContract = this.stockManager;
    else if (contractType === "request") targetContract = this.requestManager;
    else if (contractType === "logger") targetContract = this.logger;
    else return { success: false, error: "Invalid contract type" };
    if (!targetContract)
      return {
        success: false,
        error: `${contractType} contract not initialized`,
      };

    try {
      const logs = await this.web3.eth.getPastLogs({
        address: targetContract.options.address,
        fromBlock,
        toBlock,
      });

      const decodedLogs = logs.map((log) => {
        const event = targetContract.options.jsonInterface.find(
          (e) =>
            e.signature === log.topics[0] ||
            this.web3.utils.keccak256(
              e.name + "(" + e.inputs?.map((i) => i.type).join(",") + ")"
            ) === log.topics[0]
        );
        if (!event) return { raw: log };
        const decoded = this.web3.eth.abi.decodeLog(
          event.inputs,
          log.data,
          log.topics.slice(1)
        );
        return {
          event: event.name,
          ...decoded,
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber,
        };
      });

      return { success: true, logs: decodedLogs };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new Web3Service();
