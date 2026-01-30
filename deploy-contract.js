const { ethers } = require("ethers");

const PRIVATE_KEY = "0xa83a32d87412087d7e4c9dabd35557ae1d6d9cd6cbbf79d4a1c81b5b1bbaff45";
const RPC_URL = "http://127.0.0.1:8545";

const CONTRACT_BYTECODE = "0x608060405234801561001057600080fd5b50610560806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80630bebc4a814610046578063a5bea4b91461005b578063d7ba8b601461006e575b600080fd5b610059610054366004610386565b610097565b005b610059610069366004610386565b61016f565b61008161007c366004610386565b61025b565b60405161008e9190610426565b60405180910390f35b60008181526020819052604090205473ffffffffffffffffffffffffffffffffffffffff161561010e5760405162461bcd60e51b815260206004820152601860248201527f4174746573746174696f6e20616c726561647920657869737473000000000000604482015260640160405180910390fd5b600081815260208190526040808220805473ffffffffffffffffffffffffffffffffffffffff191633179055517f9fa61e1ec88d56f34d9c58e6f8f4f2bb9b8f8c6e8a7b1d5a6c7b0c3f8e9d0a2b91a250565b60008181526020819052604090205473ffffffffffffffffffffffffffffffffffffffff163314610203576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601a60248201527f4f6e6c792074686520697373756572206361682072657661926b65000000000060448201526064015b60405180910390fd5b600081815260208181526040808320805473ffffffffffffffffffffffffffffffffffffffff191690555183917f9fa61e1ec88d56f34d9c58e6f8f4f2bb9b8f8c6e8a7b1d5a6c7b0c3f8e9d0a2c91a250565b600081815260208190526040812054156102785750600192915050565b50600090565b600082601f83011261028f57600080fd5b813567ffffffffffffffff808211156102aa576102aa610531565b604051601f8301601f19908116603f011681019082821181831017156102d2576102d2610531565b816040528381528660208588010111156102eb57600080fd5b836020870160208301376000602085830101528094505050505092915050565b6000602082840312156103175760003260200152600080fd5b813561032281610547565b9392505050565b60006020828403121561033b57600080fd5b5035919050565b6000602082840312156103245760003260200152600080fd5b813567ffffffffffffffff8111156103a157600080fd5b61030d8482850161027e565b600081518084526020808501945080840160005b838110156103e75781518752958201959082019060010161030b565b509495945050505050565b6020815260006103226020830184610327565b60006020828403121561041757600080fd5b81356103228161057d565b9115158252604081016103228260208301610440565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b73ffffffffffffffffffffffffffffffffffffffff8116811461047c57600080fd5b5056fea26469706673582212207e9d8f8e8f8c8b8a8988878685848382818080817f7e7d7c7b7a797877767564736f6c63430008110033";

const CONTRACT_ABI = [
    {
        "inputs": [{ "internalType": "bytes32", "name": "hash", "type": "bytes32" }],
        "name": "attest",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "bytes32", "name": "hash", "type": "bytes32" }],
        "name": "verify",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "bytes32", "name": "hash", "type": "bytes32" }],
        "name": "revoke",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "bytes32", "name": "hash", "type": "bytes32" },
            { "indexed": true, "internalType": "address", "name": "issuer", "type": "address" }
        ],
        "name": "AttestationStored",
        "type": "event"
    }
];

async function main() {
    console.log("Connecting to Ganache...");
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log("Deployer address:", wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");

    console.log("Deploying AttestationRegistry...");
    const factory = new ethers.ContractFactory(CONTRACT_ABI, CONTRACT_BYTECODE, wallet);
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("✅ Contract deployed at:", address);

    // Write to .env.local
    const fs = require('fs');
    fs.writeFileSync('.env.local', `NEXT_PUBLIC_CONTRACT_ADDRESS=${address}\n`);
    console.log("✅ Contract address saved to .env.local");
}

main().catch(console.error);
