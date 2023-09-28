require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "calibrationnet",
  networks: {
    Fmainnet: {
      url: `https://rpcapi.fantom.network`,
      chainId: 250,
      accounts: [
        process.env.ACCOUNT1,
        process.env.ACCOUNT2,
        process.env.ACCOUNT3,
      ],
    },
    goerli: {
      url: process.env.GOERLI_RPC_URL,
      accounts: [
        process.env.ACCOUNT2,
        process.env.ACCOUNT1,
        process.env.ACCOUNT3,
        process.env.ACCOUNT4,
      ],
    },
    mumbai: {
      url: process.env.MUMBAI_RPC_URL,
      accounts: [
        process.env.ACCOUNT2,
        process.env.ACCOUNT1,
        process.env.ACCOUNT3,
        process.env.ACCOUNT4,
      ],
    },
    calibrationnet: {
      chainId: 314159,
      url: process.env.CALIBRATIONNET_RPC_URL,
      accounts: [
        process.env.ACCOUNT4,
        process.env.ACCOUNT1,
        process.env.ACCOUNT3,
        process.env.ACCOUNT2,
      ],
    },
  },
};
