require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {},
    seiTestnet: {
      url: process.env.SEI_TESTNET_URL || "https://evm-rpc-testnet.sei-apis.com",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 1328, // Sei EVM Testnet chain ID
    },
  },
};
