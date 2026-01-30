
const fs = require('fs');

const node1 = "0xa45aa8befd87bfc362a1dc922634292017754c7a";
const node2 = "0xdbe823aa299b233eb1fc41c865c1670bf92ff255";

const genesis = {
    "config": {
        "chainId": 211344,
        "homesteadBlock": 0,
        "eip150Block": 0,
        "eip155Block": 0,
        "eip158Block": 0,
        "byzantiumBlock": 0,
        "constantinopleBlock": 0,
        "petersburgBlock": 0,
        "istanbulBlock": 0,
        "berlinBlock": 0,
        "londonBlock": 0,
        "clique": {
            "period": 10,
            "epoch": 30000
        }
    },
    "difficulty": "1",
    "gasLimit": "30000000",
    "extradata": "0x" + "0".repeat(64) + node1.replace('0x', '') + node2.replace('0x', '') + "0".repeat(130),
    "alloc": {
        [node1]: { "balance": "1000000000000000000000000" },
        [node2]: { "balance": "1000000000000000000000000" }
    }
};

fs.writeFileSync('blockchain-network/genesis.json', JSON.stringify(genesis, null, 2));
console.log("Genesis file updated with new Chain ID 211344.");
