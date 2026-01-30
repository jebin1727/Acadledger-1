
const crypto = require('crypto');
const fs = require('fs');

function generateNodeKey(path) {
    const key = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(path, key);
}

generateNodeKey('blockchain-network/nodekey1');
generateNodeKey('blockchain-network/nodekey2');
console.log("Node keys generated.");
