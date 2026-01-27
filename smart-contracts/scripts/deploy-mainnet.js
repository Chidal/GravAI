const hre = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
  const RPC_URL = process.env.OG_MAINNET_RPC_URL || "https://evmrpc.0g.ai";
  const PRIVATE_KEY = process.env.PRIVATE_KEY;

  if (!PRIVATE_KEY) throw new Error("⛔ PRIVATE_KEY not set in .env file");

  console.log("🚀 Starting deployment...");

  let deployer;

  try {
    const [signer] = await hre.ethers.getSigners();
    deployer = signer;
    console.log("Using Hardhat signer:", deployer.address);
  } catch (err) {
    console.warn("⚠️ getSigners() failed, switching to manual wallet:", err.message);
    const provider = new hre.ethers.JsonRpcProvider(RPC_URL);
    deployer = new hre.ethers.Wallet(PRIVATE_KEY, provider);
    console.log("Using manual signer:", deployer.address);
  }

  // ✅ Get balance using provider (Ethers v6 compliant)
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "0G");

  if (balance === 0n) throw new Error("⛔ Deployer wallet has 0 balance");

  console.log("✅ Wallet funded, deploying OGVOE...");

  const OGVOE = await hre.ethers.getContractFactory("OGVOE");
  const ogvoe = await OGVOE.connect(deployer).deploy();

  console.log("⏳ Waiting for transaction...");
  await ogvoe.waitForDeployment();

  const contractAddress = await ogvoe.getAddress();
  console.log("✅ OGVOE deployed at:", contractAddress);

  console.log("⏳ Waiting for 6 confirmations...");
  await ogvoe.deploymentTransaction().wait(6);

  // ✅ Verify on 0G explorer
  console.log("🔍 Verifying contract...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("✅ Contract verified successfully!");
  } catch (e) {
    console.warn("⚠️ Verification failed:", e.message);
  }

  // ✅ Save addresses to JSON
  const addresses = {
    OGVOE: contractAddress,
    Deployer: deployer.address,
  };

  fs.writeFileSync("deployedAddresses.json", JSON.stringify(addresses, null, 2));
  console.log("💾 Saved to deployedAddresses.json");

  console.log("\n🎉 Deployment Complete!");
  console.log("Contract:", contractAddress);
  console.log("Explorer: https://explorer.0g.ai/address/" + contractAddress);
}

main().catch((error) => {
  console.error("❌ Deployment error:", error);
  process.exitCode = 1;
});
