# Private Ethereum Blockchain Network

This directory contains a complete setup for a 3-node private Ethereum blockchain network using Geth (Go-Ethereum).

## Network Configuration

**Chain ID:** 12345
**Consensus:** Clique (Proof of Authority)
**Network ID:** 12345

## Node Configuration

### Node 1
- **P2P Port:** 30301
- **RPC Endpoint:** http://127.0.0.1:8501
- **Account:** 0x21C9070F598DDebFbdE257e96aE67972205d584f
- **Data Directory:** ./node1

### Node 2
- **P2P Port:** 30302  
- **RPC Endpoint:** http://127.0.0.1:8502
- **Account:** 0x28c477f0B44776B565d9706FE6a8e4e78E2F76Fc
- **Data Directory:** ./node2

### Node 3
- **P2P Port:** 30303
- **RPC Endpoint:** http://127.0.0.1:8503
- **Account:** 0x759CD9B0c9a53c61f9a48AA3c7Fe815ede6f95D3
- **Data Directory:** ./node3

## Backend Integration

### RPC Endpoints for Your Application

You can connect your backend application to any of these RPC endpoints:

```javascript
// Node.js example with Web3.js
const Web3 = require('web3');

// Connect to any node (or use multiple for redundancy)
const web3 = new Web3('http://127.0.0.1:8501'); // Node 1
// const web3 = new Web3('http://127.0.0.1:8502'); // Node 2  
// const web3 = new Web3('http://127.0.0.1:8503'); // Node 3

// Test connection
web3.eth.getBlockNumber().then(console.log);
```

### Available APIs

Each node exposes the following APIs:
- **eth**: Ethereum-related methods
- **net**: Network-related methods  
- **web3**: Web3-related methods
- **personal**: Account management (use with caution)
- **miner**: Mining-related methods

### Network Details

```json
{
  "networkId": 12345,
  "chainId": 12345,
  "rpcUrls": [
    "http://127.0.0.1:8501",
    "http://127.0.0.1:8502", 
    "http://127.0.0.1:8503"
  ],
  "nativeCurrency": {
    "name": "Ethereum",
    "symbol": "ETH",
    "decimals": 18
  }
}
```

## Starting the Network

### Method 1: Using Batch Scripts
1. Open 3 separate command prompt windows
2. Run each startup script in a different window:
   ```cmd
   start-node1.bat
   start-node2.bat
   start-node3.bat
   ```

### Method 2: Manual Start
```cmd
# Node 1
geth --datadir node1 --networkid 12345 --port 30301 --http --http.addr "127.0.0.1" --http.port 8501 --http.corsdomain "*" --http.api "eth,net,web3,personal,miner" --mine --miner.etherbase 0x21C9070F598DDebFbdE257e96aE67972205d584f --unlock 0x21C9070F598DDebFbdE257e96aE67972205d584f --password node1\password.txt --allow-insecure-unlock --nodiscover console

# Node 2  
geth --datadir node2 --networkid 12345 --port 30302 --http --http.addr "127.0.0.1" --http.port 8502 --http.corsdomain "*" --http.api "eth,net,web3,personal,miner" --mine --miner.etherbase 0x28c477f0B44776B565d9706FE6a8e4e78E2F76Fc --unlock 0x28c477f0B44776B565d9706FE6a8e4e78E2F76Fc --password node2\password.txt --allow-insecure-unlock --nodiscover console

# Node 3
geth --datadir node3 --networkid 12345 --port 30303 --http --http.addr "127.0.0.1" --http.port 8503 --http.corsdomain "*" --http.api "eth,net,web3,personal,miner" --mine --miner.etherbase 0x759CD9B0c9a53c61f9a48AA3c7Fe815ede6f95D3 --unlock 0x759CD9B0c9a53c61f9a48AA3c7Fe815ede6f95D3 --password node3\password.txt --allow-insecure-unlock --nodiscover console
```

## Connecting Nodes in P2P Network

1. Start all three nodes using the methods above
2. In each node's console, get the enode URL:
   ```javascript
   admin.nodeInfo.enode
   ```
3. Connect the nodes by running these commands in each console:
   ```javascript
   // In Node 1, add Node 2 and Node 3
   admin.addPeer("enode://[NODE2_ID]@127.0.0.1:30302")
   admin.addPeer("enode://[NODE3_ID]@127.0.0.1:30303")
   
   // In Node 2, add Node 1 and Node 3  
   admin.addPeer("enode://[NODE1_ID]@127.0.0.1:30301")
   admin.addPeer("enode://[NODE3_ID]@127.0.0.1:30303")
   
   // In Node 3, add Node 1 and Node 2
   admin.addPeer("enode://[NODE1_ID]@127.0.0.1:30301") 
   admin.addPeer("enode://[NODE2_ID]@127.0.0.1:30302")
   ```

## Testing the Network

Once nodes are connected, you can test the network:

```javascript
// Check connected peers
admin.peers

// Check current block number
eth.blockNumber

// Check account balances
eth.getBalance(eth.accounts[0])

// Send a transaction
eth.sendTransaction({from: eth.accounts[0], to: "0x742d35Cc6635C0532925a3b8D4C3bf5F8E15C93", value: web3.toWei(1, "ether")})
```

## Files Structure

```
gethBlockchain/
├── genesis.json          # Genesis block configuration
├── node1/               # Node 1 data directory
├── node2/               # Node 2 data directory  
├── node3/               # Node 3 data directory
├── start-node1.bat      # Node 1 startup script
├── start-node2.bat      # Node 2 startup script
├── start-node3.bat      # Node 3 startup script
├── connect-nodes.bat    # P2P connection helper
└── README.md           # This documentation
```

## Security Notes

- All nodes use the password "123456789" stored in password.txt files
- Accounts are unlocked for mining (use --allow-insecure-unlock)
- This is for development/testing only - NOT for production use
- RPC endpoints accept connections from any origin (*)

## Troubleshooting

### Common Issues:

1. **"unauthorized signer" error**: This is normal for Clique consensus until proper signers are configured
2. **Port already in use**: Make sure ports 30301-30303 and 8501-8503 are available
3. **Connection refused**: Ensure all nodes are running and firewall allows local connections
4. **Mining not working**: Check that accounts are properly unlocked and have sufficient balance

For more advanced configuration, consult the [Geth documentation](https://geth.ethereum.org/docs/).