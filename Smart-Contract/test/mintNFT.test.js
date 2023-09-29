// Import Hardhat Runtime Environment
// const { ethers, deployments, getNamedAccounts } = require('hardhat');

describe("HealthSyncNFTFactory", function () {
  let nftFactory;
  let deployer;
  let user1;
  let user2;
  let initialOwners;
  

  // Deploy the contracts before each test
  beforeEach(async () => {
    // Get named accounts
    [deployer, user1, user2] = await ethers.getSigners();

    // Deploy the HealthSyncNFTFactory contract
    const HealthSyncNFTFactory = await ethers.getContractFactory(
      "HealthSyncNFTFactory"
    );
    nftFactory = await HealthSyncNFTFactory.deploy();

    await nftFactory.deployed();

    // Define initial owners
    initialOwners = [user1.address, user2.address];
  });

  it("should create a new NFT contract and mint NFTs", async function () {
    console.log("contract address ", nftFactory.address);

    // Create a new NFT contract with the factory
    const xx = await nftFactory.createNFT(
      "HealthSync Medical NFT",
      "HSNFT",
      "metadataCID",
      initialOwners
    );

    await xx.wait();

    // Find the contract address by CID
    const foundAddress = await nftFactory.findContractByCID("metadataCID");
    console.log("Deployed contract address:", foundAddress);

    // Connect to the deployed NFT contract
    const NFT = await ethers.getContractFactory("HealthSyncNFT");
    const nft = await NFT.attach(foundAddress);

    // Check the balance of user1
    const user1Balance = await nft.balanceOf(user1.address);
    console.log("user 1 balance", user1Balance);
  }).timeout(600000000000);
});
