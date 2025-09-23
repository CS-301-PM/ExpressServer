const Web3 = require('web3'); // If using web3 v2.x, use: require('web3').default
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function deployContract() {
  try {
    // Connect to Ganache
    const web3 = new Web3(process.env.WEB3_PROVIDER_URI || 'http://127.0.0.1:8545');

    // Get accounts
    const accounts = await web3.eth.getAccounts();
    const deployer = accounts[0];

    console.log('Deploying from account:', deployer);
    console.log(
      'Account balance:',
      web3.utils.fromWei(await web3.eth.getBalance(deployer), 'ether'),
      'ETH'
    );

    // Read compiled contract JSON (output from Hardhat or Remix)
    const compiledPath = path.join(__dirname, 'build', 'CBUStores.json');
    if (!fs.existsSync(compiledPath)) {
      throw new Error('Compiled contract not found. Please compile with Hardhat or Remix.');
    }

    const compiledContract = JSON.parse(fs.readFileSync(compiledPath, 'utf8'));
    const { abi, bytecode } = compiledContract;

    // Deploy contract
    const contract = new web3.eth.Contract(abi);

    const deployment = contract.deploy({ data: bytecode, arguments: [] });

    const gasEstimate = await deployment.estimateGas({ from: deployer });
    const gasPrice = await web3.eth.getGasPrice();

    const deployed = await deployment.send({
      from: deployer,
      gas: Math.floor(gasEstimate * 1.2),
      gasPrice,
    });

    console.log('🎉 Contract deployed!');
    console.log('Contract address:', deployed.options.address);
    console.log('Transaction hash:', deployed.transactionHash);

    // Update .env file
    updateEnvFile(deployed.options.address, deployer);

    return deployed.options.address;
  } catch (err) {
    console.error('Deployment failed:', err);
  }
}

function updateEnvFile(contractAddress, deployerAddress) {
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  if (fs.existsSync(envPath)) envContent = fs.readFileSync(envPath, 'utf8');

  const lines = envContent.split('\n').filter(Boolean);
  const newLines = lines.filter(
    (line) =>
      !line.startsWith('CONTRACT_ADDRESS=') &&
      !line.startsWith('DEPLOYER_ACCOUNT_ADDRESS=') &&
      !line.startsWith('DEPLOYER_PRIVATE_KEY=')
  );

  newLines.push(`CONTRACT_ADDRESS=${contractAddress}`);
  newLines.push(`DEPLOYER_ACCOUNT_ADDRESS=${deployerAddress}`);
  // Use your actual deployer private key from Ganache here
  newLines.push(`DEPLOYER_PRIVATE_KEY=${process.env.DEPLOYER_PRIVATE_KEY}`);

  fs.writeFileSync(envPath, newLines.join('\n'));
  console.log('✅ .env updated with deployment info');
}

// Run deployment
deployContract();
