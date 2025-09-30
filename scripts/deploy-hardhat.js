// scripts/deploy-hardhat.js
// Deploy GenericLoggerPeerApproved with peers, then write address to .env

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

function upsertEnvVar(envPath, key, value) {
  const line = `${key}=${value}`;
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, `${line}\n`);
    return;
  }
  const content = fs.readFileSync(envPath, "utf8");
  const regex = new RegExp(`^${key}=.*$`, "m");
  if (regex.test(content)) {
    const updated = content.replace(regex, line);
    fs.writeFileSync(envPath, updated);
  } else {
    fs.appendFileSync(envPath, `\n${line}\n`);
  }
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();

  console.log("Deploying GenericLoggerPeerApproved...");
  console.log("Deployer:", deployerAddress);

  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network.name, "(Chain ID:", network.chainId, ")");

  // Get peer addresses from environment or use deployer as fallback
  const peers = [
    process.env.PEER1_ADDRESS || deployerAddress,
    process.env.PEER2_ADDRESS || deployerAddress,
    process.env.PEER3_ADDRESS || deployerAddress,
  ];

  console.log("Peers configured:");
  peers.forEach((peer, index) => {
    console.log(`  Peer ${index + 1}: ${peer}`);
  });

  // Validate that we have 3 unique addresses for production
  const uniquePeers = new Set(peers);
  if (uniquePeers.size < 3 && process.env.NODE_ENV === "production") {
    console.warn(
      "⚠️  WARNING: Less than 3 unique peer addresses detected in production!"
    );
    console.warn(
      "   This reduces security. Consider using different addresses for each peer."
    );
  }

  try {
    // Deploy GenericLoggerPeerApproved
    console.log("\n📦 Deploying GenericLoggerPeerApproved contract...");
    const GenericLogger = await hre.ethers.getContractFactory(
      "GenericLoggerPeerApproved"
    );
    const genericLogger = await GenericLogger.deploy(peers);

    console.log("⏳ Waiting for deployment confirmation...");
    await genericLogger.waitForDeployment();

    const genericLoggerAddress = await genericLogger.getAddress();
    console.log(
      "✅ GenericLoggerPeerApproved deployed at:",
      genericLoggerAddress
    );

    // Verify deployment by checking peer addresses
    console.log("\n🔍 Verifying deployment...");
    const deployedPeer1 = await genericLogger.peers(0);
    const deployedPeer2 = await genericLogger.peers(1);
    const deployedPeer3 = await genericLogger.peers(2);

    console.log("Deployed peers verification:");
    console.log(
      `  Peer 1: ${deployedPeer1} ${deployedPeer1 === peers[0] ? "✅" : "❌"}`
    );
    console.log(
      `  Peer 2: ${deployedPeer2} ${deployedPeer2 === peers[1] ? "✅" : "❌"}`
    );
    console.log(
      `  Peer 3: ${deployedPeer3} ${deployedPeer3 === peers[2] ? "✅" : "❌"}`
    );

    // Update .env file with contract address
    const envPath = path.resolve(process.cwd(), ".env");
    const suffix = process.env.ADDR_SUFFIX || ""; // e.g. _NODE2, _NODE3 for multi-node setups

    if (suffix) {
      upsertEnvVar(
        envPath,
        `GENERIC_LOGGER_ADDRESS${suffix}`,
        genericLoggerAddress
      );
      console.log(`\n📝 Updated .env with GENERIC_LOGGER_ADDRESS${suffix}`);
    } else {
      upsertEnvVar(envPath, "GENERIC_LOGGER_ADDRESS", genericLoggerAddress);
      // Also set as CONTRACT_ADDRESS for backward compatibility
      upsertEnvVar(envPath, "CONTRACT_ADDRESS", genericLoggerAddress);
      console.log(
        "\n📝 Updated .env with GENERIC_LOGGER_ADDRESS and CONTRACT_ADDRESS"
      );
    }

    // Display usage examples
    console.log("\n🚀 Deployment Complete! Usage examples:");
    console.log("----------------------------------------");
    console.log("// JavaScript/Web3 usage:");
    console.log(`const contractAddress = "${genericLoggerAddress}";`);
    console.log(
      "const contract = new ethers.Contract(contractAddress, abi, signer);"
    );
    console.log("");
    console.log("// Propose an entry:");
    console.log(
      'await contract.proposeEntry("USER_SIGNUP", \'{"username":"alice"}\');'
    );
    console.log("");
    console.log("// Approve an entry (as peer):");
    console.log("await contract.approveEntry(1);");
    console.log("");
    console.log("// Get all logged entries:");
    console.log("const entries = await contract.getAllEntries();");

    // Save deployment info to a JSON file for other scripts
    const deploymentInfo = {
      contractName: "GenericLoggerPeerApproved",
      contractAddress: genericLoggerAddress,
      deployer: deployerAddress,
      peers: peers,
      network: {
        name: network.name,
        chainId: network.chainId.toString(),
      },
      deployedAt: new Date().toISOString(),
      transactionHash: genericLogger.deploymentTransaction?.hash,
    };

    const deploymentPath = path.resolve(process.cwd(), "deployment-info.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);
  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);

    // Check for common issues
    if (error.message.includes("invalid address")) {
      console.error("\n🔧 Possible fixes:");
      console.error(
        "   - Check that PEER1_ADDRESS, PEER2_ADDRESS, PEER3_ADDRESS are valid Ethereum addresses"
      );
      console.error("   - Ensure addresses are properly formatted (0x...)");
    }

    if (error.message.includes("insufficient funds")) {
      console.error("\n🔧 Possible fixes:");
      console.error("   - Ensure deployer account has enough ETH for gas fees");
      console.error("   - Check network connection and gas settings");
    }

    throw error;
  }
}

// Handle script execution
main()
  .then(() => {
    console.log("\n🎉 Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error);
    process.exitCode = 1;
  });
