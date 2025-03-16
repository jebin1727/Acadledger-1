import { ethers } from "ethers";

export const abi: ethers.Interface | ethers.InterfaceAbi = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "docHash",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "issuer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "issuedAt",
          "type": "uint256"
        }
      ],
      "name": "DocumentIssued",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "docHash",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "revokedBy",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "revokedAt",
          "type": "uint256"
        }
      ],
      "name": "DocumentRevoked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "institution",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "metadata",
          "type": "string"
        }
      ],
      "name": "InstitutionAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "institution",
          "type": "address"
        }
      ],
      "name": "InstitutionRemoved",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "institution",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "metadata",
          "type": "string"
        }
      ],
      "name": "addInstitution",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "documentArray",
      "outputs": [
        {
          "internalType": "string",
          "name": "docHash",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "issuer",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "issuedAt",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "revoked",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "ipfsURI",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "documents",
      "outputs": [
        {
          "internalType": "string",
          "name": "docHash",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "issuer",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "issuedAt",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "revoked",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "ipfsURI",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "institutionAddress",
          "type": "address"
        }
      ],
      "name": "getInstitutionWithDocuments",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "institutionAddress",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "metadata",
              "type": "string"
            }
          ],
          "internalType": "struct CertifyChain.Institution",
          "name": "institution",
          "type": "tuple"
        },
        {
          "components": [
            {
              "internalType": "string",
              "name": "docHash",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "issuer",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "issuedAt",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "revoked",
              "type": "bool"
            },
            {
              "internalType": "string",
              "name": "ipfsURI",
              "type": "string"
            }
          ],
          "internalType": "struct CertifyChain.Document[]",
          "name": "issuedDocuments",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "institutions",
      "outputs": [
        {
          "internalType": "address",
          "name": "institutionAddress",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "metadata",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "docHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "ipfs_uri",
          "type": "string"
        }
      ],
      "name": "issueDocument",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "listDocuments",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "docHash",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "issuer",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "issuedAt",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "revoked",
              "type": "bool"
            },
            {
              "internalType": "string",
              "name": "ipfsURI",
              "type": "string"
            }
          ],
          "internalType": "struct CertifyChain.Document[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "institution",
          "type": "address"
        }
      ],
      "name": "removeInstitution",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "docHash",
          "type": "string"
        }
      ],
      "name": "revokeDocument",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "docHash",
          "type": "string"
        }
      ],
      "name": "verifyDocument",
      "outputs": [
        {
          "internalType": "bool",
          "name": "valid",
          "type": "bool"
        },
        {
          "internalType": "address",
          "name": "issuer",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "issuedAt",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "revoked",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "ipfsURI",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]