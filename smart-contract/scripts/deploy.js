const hre = require("hardhat");

async function main() {
  console.log("Deploying AI Agent Marketplace to SEI testnet...");
  
  const AIAgentMarketplace = await hre.ethers.getContractFactory("AIAgentMarketplace");
  const marketplace = await AIAgentMarketplace.deploy();
  
  await marketplace.waitForDeployment();
  
  console.log(`AIAgentMarketplace deployed to: ${await marketplace.getAddress()}`);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });