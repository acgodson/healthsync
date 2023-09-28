const hre = require("hardhat");

async function main() {
  const HealthSyncContract = await hre.ethers.getContractFactory("HealthSync");
  const healthsyncContract = await HealthSyncContract.deploy();
  await healthsyncContract.deployed();
  console.log("Contract deployed to:", healthsyncContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
