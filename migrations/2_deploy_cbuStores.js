require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const CBUStores = artifacts.require("CBUStores");
const fs = require('fs');
const path = require('path');

module.exports = async function (deployer, network, accounts) {
    // Deploy the contract
    await deployer.deploy(CBUStores);
    const deployed = await CBUStores.deployed();

    console.log('🎉 CBUStores deployed at address:', deployed.address);

    // Optional: Update .env automatically
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }

    const lines = envContent.split('\n').filter(Boolean);
    const newLines = [];
    let found = { contract: false, deployer: false };

    for (const line of lines) {
        if (line.startsWith('CONTRACT_ADDRESS=')) {
            newLines.push(`CONTRACT_ADDRESS=${deployed.address}`);
            found.contract = true;
        } else if (line.startsWith('DEPLOYER_ACCOUNT_ADDRESS=')) {
            newLines.push(`DEPLOYER_ACCOUNT_ADDRESS=${accounts[0]}`);
            found.deployer = true;
        } else {
            newLines.push(line);
        }
    }

    if (!found.contract) newLines.push(`CONTRACT_ADDRESS=${deployed.address}`);
    if (!found.deployer) newLines.push(`DEPLOYER_ACCOUNT_ADDRESS=${accounts[0]}`);

    fs.writeFileSync(envPath, newLines.join('\n'));
    console.log('✅ .env updated with deployment info');
};
