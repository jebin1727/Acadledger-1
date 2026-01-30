# AcadLedger - Private Blockchain Demo

## Quick Start (Local Ganache Network)

### Prerequisites
- Docker Desktop running
- Node.js installed

### 1. Start Local Blockchain (Ganache)
```bash
docker run -d -p 8545:8545 --name ganache trufflesuite/ganache:latest --chain.chainId 1337 --wallet.accounts "0xa83a32d87412087d7e4c9dabd35557ae1d6d9cd6cbbf79d4a1c81b5b1bbaff45,1000000000000000000000" --miner.blockTime 2
```

### 2. Deploy Contract
```bash
node deploy-contract.js
```

### 3. Configure Metamask
Add a custom network with these settings:
- **Network Name**: Ganache Local
- **RPC URL**: `http://127.0.0.1:8545`
- **Chain ID**: `1337`
- **Currency Symbol**: ETH

### 4. Import Account to Metamask
Import using private key:
```
0xa83a32d87412087d7e4c9dabd35557ae1d6d9cd6cbbf79d4a1c81b5b1bbaff45
```
This account has **1000 ETH** for testing!

### 5. Run the App
```bash
npm run dev
```

### 6. Test Attestation
1. Go to `/issuer` page
2. Connect wallet (select Ganache Local network in Metamask)
3. Fill in credential details
4. Click "Issue Credential" 
5. Confirm transaction in Metamask
6. ✅ See transaction hash!

## Contract Address
The deployed contract address is saved in `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xF9CCE1d8c103A85A11C42aEB3E83075548DC2767
```

## Account Details
- **Address**: `0xA45aA8befd87BfC362A1dC922634292017754C7A`
- **Private Key**: `0xa83a32d87412087d7e4c9dabd35557ae1d6d9cd6cbbf79d4a1c81b5b1bbaff45`
- **Balance**: 1000 ETH (for testing)
