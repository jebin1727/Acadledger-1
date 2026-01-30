
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const AttestationRegistry = await ethers.getContractFactory("AttestationRegistry");
    const attestationRegistry = await AttestationRegistry.deploy();

    await attestationRegistry.deployed();

    console.log("AttestationRegistry deployed to:", attestationRegistry.address);

    // Save address to a file for frontend to pick up if needed, or just print it
    const fs = require('fs');
    fs.writeFileSync('deployed-address.txt', attestationRegistry.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
