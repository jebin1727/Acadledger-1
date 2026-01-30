
require("@nomiclabs/hardhat-ethers");

const privateKey = "0xa83a32d87412087d7e4c9dabd35557ae1d6d9cd6cbbf79d4a1c81b5b1bbaff45"; // Node 1 Private Key

module.exports = {
    solidity: "0.8.0",
    networks: {
        custom: {
            url: "http://127.0.0.1:8549",
            chainId: 211343,
            accounts: [privateKey]
        }
    }
};
