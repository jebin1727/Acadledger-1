// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title AttestationRegistry
 * @dev A simple contract to store and verify document hashes (attestations).
 */
contract AttestationRegistry {
    // Mapping from document hash to the address of the issuer
    mapping(bytes32 => address) public attestations;

    // Events to track actions
    event AttestationStored(bytes32 indexed hash, address indexed issuer);
    event AttestationRevoked(bytes32 indexed hash, address indexed issuer);

    /**
     * @dev Stores an attestation for a given hash.
     * @param hash The Keccak256 hash of the document.
     */
    function attest(bytes32 hash) public {
        require(attestations[hash] == address(0), "Attestation already exists");
        attestations[hash] = msg.sender;
        emit AttestationStored(hash, msg.sender);
    }

    /**
     * @dev Verifies if an attestation exists for a given hash.
     * @param hash The Keccak256 hash of the document.
     * @return bool True if it exists, false otherwise.
     */
    function verify(bytes32 hash) public view returns (bool) {
        return attestations[hash] != address(0);
    }

    /**
     * @dev Revokes an attestation (only by the original issuer).
     * @param hash The Keccak256 hash of the document.
     */
    function revoke(bytes32 hash) public {
        require(attestations[hash] == msg.sender, "Only the issuer can revoke");
        delete attestations[hash];
        emit AttestationRevoked(hash, msg.sender);
    }
}
