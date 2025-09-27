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
      "http://127.0.0.1:8545",
    ].filter(Boolean);
    this.providerUrl = providerCandidates[0];

    this.web3 = new Web3(this.providerUrl);

    // Connectivity cache (updated asynchronously)
    this.connected = false;
    (async () => {
      for (const url of providerCandidates) {
        try {
          const probe = new Web3(url);
          await probe.eth.getChainId();
          this.web3 = probe;
          this.providerUrl = url;
          this.connected = true;
          break;
        } catch (_) {
          // try next candidate
        }
      }
    })();

    // Contract addresses from env (multi-contract support)
    this.userManagerAddress =
      process.env.USER_MANAGER_ADDRESS || process.env.CONTRACT_ADDRESS_USER;
    this.stockManagerAddress =
      process.env.STOCK_MANAGER_ADDRESS || process.env.CONTRACT_ADDRESS_STOCK;
    this.requestManagerAddress =
      process.env.REQUEST_MANAGER_ADDRESS ||
      process.env.CONTRACT_ADDRESS_REQUEST;

    // Attempt to load Hardhat artifacts (fallback to inline ABI if unavailable)
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

    // Back-compat single-contract fields
    this.contractAddress = process.env.CONTRACT_ADDRESS;
    this.contract = null;
    this.abi = this.getContractABI();

    // Initialize specific contracts if ABI + address available
    try {
      if (this.userManagerAbi && this.userManagerAddress) {
        this.userManager = new this.web3.eth.Contract(
          this.userManagerAbi,
          this.userManagerAddress
        );
      }
      if (this.stockManagerAbi && this.stockManagerAddress) {
        this.stockManager = new this.web3.eth.Contract(
          this.stockManagerAbi,
          this.stockManagerAddress
        );
      }
      if (this.requestManagerAbi && this.requestManagerAddress) {
        this.requestManager = new this.web3.eth.Contract(
          this.requestManagerAbi,
          this.requestManagerAddress
        );
        // For backward compatibility, default generic contract to RequestManager
        if (!this.contract && !this.contractAddress) {
          this.contract = this.requestManager;
          this.contractAddress = this.requestManagerAddress;
          this.abi = this.requestManagerAbi;
        }
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
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            indexed: true,
            internalType: "string",
            name: "role",
            type: "string",
          },
          {
            indexed: false,
            internalType: "bool",
            name: "status",
            type: "bool",
          },
        ],
        name: "RoleAssigned",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "uint256",
            name: "requestId",
            type: "uint256",
          },
          {
            indexed: true,
            internalType: "address",
            name: "requester",
            type: "address",
          },
          {
            indexed: false,
            internalType: "string",
            name: "itemName",
            type: "string",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "quantity",
            type: "uint256",
          },
        ],
        name: "RequestCreated",
        type: "event",
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

      const gasEstimate = await method(...params).estimateGas({
        from: fromAddress,
      });
      const gasPrice = await this.web3.eth.getGasPrice();

      const tx = method(...params);
      const result = await tx.send({
        from: fromAddress,
        gas: Math.round(gasEstimate * 1.2),
        gasPrice,
      });

      return { success: true, transactionHash: result.transactionHash };
    } catch (error) {
      console.error("Transaction failed:", error);
      return { success: false, error: error.message };
    }
  }

  async createRequestOnChain(
    itemName,
    quantity,
    _priority,
    _reason,
    userAddress,
    privateKey
  ) {
    const target = this.requestManager || this.contract;
    if (!target)
      return { success: false, error: "RequestManager not configured" };
    // Contract expects (string item, uint256 quantity)
    return this.sendTransaction(
      target.methods.createRequest,
      userAddress,
      privateKey,
      [itemName, quantity.toString()]
    );
  }

  async approveRequestOnChain(
    requestId,
    newStatus,
    _reason,
    approverAddress,
    privateKey
  ) {
    const target = this.requestManager || this.contract;
    if (!target)
      return { success: false, error: "RequestManager not configured" };
    // Map input to enum Status { PENDING(0), APPROVED(1), REJECTED(2), IN_PROGRESS(3), FULFILLED(4) }
    const mapStatus = (val) => {
      if (typeof val === "boolean") return val ? 1 : 2;
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
      return 0; // default to PENDING
    };
    const statusCode = mapStatus(newStatus);
    return this.sendTransaction(
      target.methods.approveRequest,
      approverAddress,
      privateKey,
      [requestId.toString(), statusCode]
    );
  }

  async assignRoleOnChain(_userAddress, _role, _status, _adminPrivateKey) {
    // Not implemented in current UserManager.sol
    return {
      success: false,
      error: "assignRoleOnChain not supported by UserManager.sol",
    };
  }

  async subscribeToEvents() {
    if (!this.contract) return false;

    try {
      const isListening = await this.web3.eth.net.isListening();
      if (!isListening) return false;

      const subscription = await this.web3.eth.subscribe("logs", {
        address: this.contractAddress,
        topics: [],
      });

      subscription.on("data", (log) => {
        try {
          const decodedLog = this.web3.eth.abi.decodeLog(
            this.getEventInputs(log.topics[0]),
            log.data,
            log.topics.slice(1)
          );
          const eventName = this.getEventName(log.topics[0]);
          console.log(eventName, {
            ...decodedLog,
            transactionHash: log.transactionHash,
            blockNumber: log.blockNumber,
          });
        } catch {
          console.log({
            address: log.address,
            transactionHash: log.transactionHash,
            blockNumber: log.blockNumber,
          });
        }
      });

      subscription.on("error", console.error);

      this.eventSubscription = subscription;
      return true;
    } catch {
      return this.setupFallbackEventListening();
    }
  }

  getEventName(topicHash) {
    const eventSignatures = {
      [this.web3.utils.keccak256("RoleAssigned(address,string,bool)")]:
        "RoleAssigned",
      [this.web3.utils.keccak256(
        "RequestCreated(uint256,address,string,uint256)"
      )]: "RequestCreated",
      [this.web3.utils.keccak256(
        "RequestApproved(uint256,address,bool,string)"
      )]: "RequestApproved",
    };
    return eventSignatures[topicHash] || "Unknown";
  }

  getEventInputs(topicHash) {
    const eventInputs = {
      [this.web3.utils.keccak256("RoleAssigned(address,string,bool)")]: [
        { indexed: true, name: "user", type: "address" },
        { indexed: true, name: "role", type: "string" },
        { indexed: false, name: "status", type: "bool" },
      ],
      [this.web3.utils.keccak256(
        "RequestCreated(uint256,address,string,uint256)"
      )]: [
        { indexed: true, name: "requestId", type: "uint256" },
        { indexed: true, name: "requester", type: "address" },
        { indexed: false, name: "itemName", type: "string" },
        { indexed: false, name: "quantity", type: "uint256" },
      ],
    };
    return eventInputs[topicHash] || [];
  }

  setupFallbackEventListening() {
    try {
      this.eventPollingInterval = setInterval(async () => {
        try {
          const latestBlock = await this.web3.eth.getBlockNumber();
          const fromBlock = Math.max(0, latestBlock - 5);
          const logs = await this.web3.eth.getPastLogs({
            address: this.contractAddress,
            fromBlock,
            toBlock: "latest",
          });
          if (logs.length) console.log(`Found ${logs.length} recent events`);
        } catch {}
      }, 5000);
      return true;
    } catch {
      return false;
    }
  }

  cleanup() {
    if (this.eventSubscription) this.eventSubscription.unsubscribe();
    if (this.eventPollingInterval) clearInterval(this.eventPollingInterval);
  }

  initializeContract(contractAddress) {
    if (!contractAddress) return false;
    try {
      this.contractAddress = contractAddress;
      this.contract = new this.web3.eth.Contract(this.abi, contractAddress);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = new Web3Service();
