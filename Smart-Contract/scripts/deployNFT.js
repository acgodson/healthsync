const hre = require("hardhat");

async function main() {
  const HealthSyncNFTFactory = await hre.ethers.getContractFactory("HealthSyncNFTFactory");
  const healthSyncNFTFactory = await HealthSyncNFTFactory.deploy();
  await healthSyncNFTFactory.deployed();
  console.log("NFT Factory  deployed to:", healthSyncNFTFactory.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
