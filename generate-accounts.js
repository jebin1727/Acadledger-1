
const { ethers } = require("ethers");
const fs = require("fs");

async function generateAccounts() {
    const wallet1 = ethers.Wallet.createRandom();
    const wallet2 = ethers.Wallet.createRandom();

    console.log("Node 1 Address:", wallet1.address);
    console.log("Node 1 Private Key:", wallet1.privateKey);
    console.log("Node 2 Address:", wallet2.address);
    console.log("Node 2 Private Key:", wallet2.privateKey);

    const accounts = {
        node1: {
            address: wallet1.address,
            privateKey: wallet1.privateKey
        },
        node2: {
            address: wallet2.address,
            privateKey: wallet2.privateKey
        }
    };

    fs.writeFileSync("blockchain-network/accounts.json", JSON.stringify(accounts, null, 2));
}

generateAccounts();
