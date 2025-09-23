// Web3 v4 style imports
const { Web3 } = require('web3');
const crypto = require('crypto');

class Web3Service {
    constructor() {
        this.providerUrl = process.env.WEB3_PROVIDER_URI || 'http://127.0.0.1:7545';
        this.web3 = new Web3(this.providerUrl); // ✅ v4 allows direct URL
        this.contractAddress = process.env.CONTRACT_ADDRESS;
        this.contract = null;
        this.abi = this.getContractABI();

        if (this.contractAddress) {
            this.contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        }
    }

    getContractABI() {
        return [
            {
                "inputs": [],
                "name": "getContractInfo",
                "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    { "internalType": "address", "name": "user", "type": "address" },
                    { "internalType": "string", "name": "role", "type": "string" },
                    { "internalType": "bool", "name": "status", "type": "bool" }
                ],
                "name": "assignRole",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    { "internalType": "string", "name": "itemName", "type": "string" },
                    { "internalType": "uint256", "name": "quantity", "type": "uint256" },
                    { "internalType": "string", "name": "priority", "type": "string" },
                    { "internalType": "string", "name": "reason", "type": "string" }
                ],
                "name": "createRequest",
                "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    { "internalType": "uint256", "name": "requestId", "type": "uint256" },
                    { "internalType": "bool", "name": "approved", "type": "bool" },
                    { "internalType": "string", "name": "reason", "type": "string" }
                ],
                "name": "approveRequest",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    { "internalType": "string", "name": "itemName", "type": "string" },
                    { "internalType": "int256", "name": "quantityChange", "type": "int256" },
                    { "internalType": "string", "name": "reason", "type": "string" }
                ],
                "name": "adjustStock",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "anonymous": false,
                "inputs": [
                    { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
                    { "indexed": true, "internalType": "string", "name": "role", "type": "string" },
                    { "indexed": false, "internalType": "bool", "name": "status", "type": "bool" }
                ],
                "name": "RoleAssigned",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    { "indexed": true, "internalType": "uint256", "name": "requestId", "type": "uint256" },
                    { "indexed": true, "internalType": "address", "name": "requester", "type": "address" },
                    { "indexed": false, "internalType": "string", "name": "itemName", "type": "string" },
                    { "indexed": false, "internalType": "uint256", "name": "quantity", "type": "uint256" }
                ],
                "name": "RequestCreated",
                "type": "event"
            }
        ];
    }

    async isConnected() {
        try {
            return await this.web3.eth.net.isListening();
        } catch (err) {
            return false;
        }
    }

    async generateBlockchainAccount() {
        const account = this.web3.eth.accounts.create();
        return {
            address: account.address,
            privateKey: account.privateKey
        };
    }

    encryptPrivateKey(privateKey) {
        const algorithm = 'aes-256-gcm';
        const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // must be 32 bytes
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv(algorithm, key, iv);
        cipher.setAAD(Buffer.from('CBUStores'));

        let encrypted = cipher.update(privateKey, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        return JSON.stringify({
            iv: iv.toString('hex'),
            data: encrypted,
            authTag: authTag.toString('hex')
        });
    }

    decryptPrivateKey(encryptedData) {
        if (!encryptedData) return null;

        try {
            const algorithm = 'aes-256-gcm';
            const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
            const data = JSON.parse(encryptedData);

            const decipher = crypto.createDecipheriv(
                algorithm,
                key,
                Buffer.from(data.iv, 'hex')
            );
            decipher.setAAD(Buffer.from('CBUStores'));
            decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));

            let decrypted = decipher.update(data.data, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }

    async sendTransaction(method, fromAddress, privateKey, params = []) {
        try {
            const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
            this.web3.eth.accounts.wallet.add(account);

            const gasEstimate = await method(...params).estimateGas({ from: fromAddress });
            const gasPrice = await this.web3.eth.getGasPrice();

            const tx = method(...params);
            const result = await tx.send({
                from: fromAddress,
                gas: Math.round(gasEstimate * 1.2),
                gasPrice
            });

            return { success: true, transactionHash: result.transactionHash };
        } catch (error) {
            console.error('Transaction failed:', error);
            return { success: false, error: error.message };
        }
    }

    async createRequestOnChain(itemName, quantity, priority, reason, userAddress, privateKey) {
        if (!this.contract) {
            return { success: false, error: 'Contract not loaded' };
        }

        return await this.sendTransaction(
            this.contract.methods.createRequest,
            userAddress,
            privateKey,
            [itemName, quantity.toString(), priority, reason]
        );
    }

    async approveRequestOnChain(requestId, approved, reason, approverAddress, privateKey) {
        if (!this.contract) {
            return { success: false, error: 'Contract not loaded' };
        }

        return await this.sendTransaction(
            this.contract.methods.approveRequest,
            approverAddress,
            privateKey,
            [requestId.toString(), approved, reason]
        );
    }

    async assignRoleOnChain(userAddress, role, status, adminPrivateKey) {
        if (!this.contract) {
            return { success: false, error: 'Contract not loaded' };
        }

        return await this.sendTransaction(
            this.contract.methods.assignRole,
            process.env.DEPLOYER_ACCOUNT_ADDRESS,
            adminPrivateKey,
            [userAddress, role, status]
        );
    }

    subscribeToEvents() {
        if (!this.contract) return;

        this.contract.events.RoleAssigned({})
            .on('data', (event) => {
                console.log('📝 RoleAssigned event:', event.returnValues);
            })
            .on('error', console.error);

        this.contract.events.RequestCreated({})
            .on('data', (event) => {
                console.log('📝 RequestCreated event:', event.returnValues);
            })
            .on('error', console.error);
    }
}

module.exports = new Web3Service();
