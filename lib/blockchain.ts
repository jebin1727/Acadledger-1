import { ethers } from "ethers";
import { abi } from "./contract";

// The address of the deployed AcadLedger contract on Polygon Amoy
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_DASHBOARD_CONTRACT_ADDRESS || "0xA09916427843c35a233BF355bFAF1C735F9e75fa";

export interface BlockchainStatus {
    isConnected: boolean;
    account?: string;
    chainId?: number;
    error?: string;
}

/**
 * Connects to the user's Metamask wallet.
 */
export async function connectWallet(): Promise<BlockchainStatus> {
    if (typeof window === "undefined" || !(window as any).ethereum) {
        return { isConnected: false, error: "Metamask is not installed" };
    }

    try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const network = await provider.getNetwork();

        return {
            isConnected: true,
            account: accounts[0],
            chainId: Number(network.chainId)
        };
    } catch (error: any) {
        console.error("Wallet connection error:", error);
        return { isConnected: false, error: error.message || "Failed to connect wallet" };
    }
}

/**
 * Attests a document hash on the blockchain (Issuer only).
 * @param hash The Keccak256 hash or IPFS CID
 * @param ipfsURI The full ipfs:// URI for metadata
 */
export async function attestOnChain(hash: string, ipfsURI: string = ""): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (typeof window === "undefined" || !(window as any).ethereum) {
        return { success: false, error: "Metamask not found" };
    }

    try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();

        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

        // AcadLedger uses issueDocument(string docHash, string ipfs_uri)
        const tx = await contract.issueDocument(hash, ipfsURI);
        await tx.wait(); // Wait for confirmation

        return { success: true, txHash: tx.hash };
    } catch (error: any) {
        console.error("Attestation error:", error);
        return { success: false, error: error.reason || error.message || "Transaction failed" };
    }
}

/**
 * Verifies if a document hash exists on the blockchain (Public view).
 * @param hash The hash to verify
 */
export async function verifyOnChain(hash: string): Promise<boolean> {
    let provider;
    if (typeof window !== "undefined" && (window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum);
    } else {
        // Fallback to public RPC
        provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology/");
    }

    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
        // AcadLedger uses verifyDocument(string docHash) -> (bool valid, address issuer, ...)
        const result = await contract.verifyDocument(hash);
        return result[0]; // valid
    } catch (error) {
        console.error("Verification error:", error);
        return false;
    }
}
