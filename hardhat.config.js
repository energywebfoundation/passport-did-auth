// Local JSON-RPC node used by the test suite (see test/testUtils/globalSetup.ts)
// and by `npm run start-rpc`.
module.exports = {
  networks: {
    hardhat: {
      chainId: 73799,
      accounts: {
        mnemonic:
          'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat',
        count: 20,
      },
      blockGasLimit: 10000000,
    },
  },
};
